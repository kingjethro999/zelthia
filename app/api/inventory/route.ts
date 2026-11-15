import { NextRequest, NextResponse } from "next/server";
import {
  getAllFacilities,
  getFacilityById,
  addFacility,
  queryInventory,
  updateStockCount,
  quickRestockItem,
  addInventoryItem,
  updateInventoryItemDetails,
  deleteInventoryItem,
  getFacilityMetrics,
  resetInventoryToSeed,
  StockStatus,
  FacilityType,
  DrugCategory,
  DosageForm,
} from "@/lib/inventory-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const facilityId = searchParams.get("facilityId") || undefined;
    const dosageForm = searchParams.get("dosageForm") || undefined;
    const status = (searchParams.get("status") as StockStatus) || undefined;
    const onlyInStock = searchParams.get("onlyInStock") === "true";
    const type = searchParams.get("type");

    // If caller specifically requested just facilities
    if (type === "facilities") {
      const facilities = getAllFacilities();
      return NextResponse.json({ success: true, facilities });
    }

    // If caller specifically requested just metrics
    if (type === "metrics") {
      const metrics = getFacilityMetrics(facilityId);
      return NextResponse.json({ success: true, metrics });
    }

    const { items, total } = queryInventory({
      search,
      category,
      facilityId,
      dosageForm,
      status,
      onlyInStock,
    });

    const facilities = getAllFacilities();
    const metrics = getFacilityMetrics(facilityId);

    return NextResponse.json({
      success: true,
      items,
      total,
      facilities,
      metrics,
    });
  } catch (error) {
    console.error("Inventory GET API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while fetching inventory",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Missing required field: action" },
        { status: 400 },
      );
    }

    switch (action) {
      case "update_stock": {
        const { itemId, stockCount } = body;
        if (!itemId || typeof stockCount !== "number") {
          return NextResponse.json(
            {
              success: false,
              error: "itemId and numeric stockCount are required",
            },
            { status: 400 },
          );
        }
        const updated = updateStockCount(itemId, stockCount);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: `Item with id ${itemId} not found` },
            { status: 404 },
          );
        }
        const metrics = getFacilityMetrics(updated.facilityId);
        return NextResponse.json({
          success: true,
          message: "Stock count updated successfully",
          item: updated,
          metrics,
        });
      }

      case "quick_restock": {
        const { itemId, delta } = body;
        if (!itemId || typeof delta !== "number") {
          return NextResponse.json(
            { success: false, error: "itemId and numeric delta are required" },
            { status: 400 },
          );
        }
        const updated = quickRestockItem(itemId, delta);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: `Item with id ${itemId} not found` },
            { status: 404 },
          );
        }
        const metrics = getFacilityMetrics(updated.facilityId);
        return NextResponse.json({
          success: true,
          message: `Restocked by +${delta}`,
          item: updated,
          metrics,
        });
      }

      case "add_item": {
        const { item } = body;
        if (
          !item ||
          !item.facilityId ||
          !item.name ||
          !item.genericFormula ||
          !item.category ||
          !item.dosageForm ||
          typeof item.stockCount !== "number" ||
          typeof item.unitPrice !== "number"
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Missing required item properties for add_item",
            },
            { status: 400 },
          );
        }

        const facility = getFacilityById(item.facilityId);
        if (!facility) {
          return NextResponse.json(
            {
              success: false,
              error: `Facility ${item.facilityId} does not exist`,
            },
            { status: 404 },
          );
        }

        const createdItem = addInventoryItem({
          facilityId: item.facilityId,
          name: item.name.trim(),
          genericFormula: item.genericFormula.trim(),
          category: item.category as DrugCategory,
          dosageForm: item.dosageForm as DosageForm,
          strength: item.strength?.trim() || "Standard",
          stockCount: Math.max(0, item.stockCount),
          minThreshold: item.minThreshold ?? 5,
          unitPrice: Math.max(0, item.unitPrice),
          batchNumber:
            item.batchNumber?.trim() ||
            `B-${Date.now().toString(36).toUpperCase()}`,
          expiryDate:
            item.expiryDate ||
            new Date(Date.now() + 365 * 24 * 3600 * 1000)
              .toISOString()
              .split("T")[0],
          requiresPrescription: Boolean(item.requiresPrescription),
          notes: item.notes?.trim() || undefined,
        });

        const metrics = getFacilityMetrics(createdItem.facilityId);
        return NextResponse.json(
          {
            success: true,
            message: "Inventory item added successfully",
            item: createdItem,
            metrics,
          },
          { status: 201 },
        );
      }

      case "update_item": {
        const { itemId, updates } = body;
        if (!itemId || !updates) {
          return NextResponse.json(
            { success: false, error: "itemId and updates object are required" },
            { status: 400 },
          );
        }
        const updated = updateInventoryItemDetails(itemId, updates);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: `Item with id ${itemId} not found` },
            { status: 404 },
          );
        }
        const metrics = getFacilityMetrics(updated.facilityId);
        return NextResponse.json({
          success: true,
          message: "Item updated successfully",
          item: updated,
          metrics,
        });
      }

      case "delete_item": {
        const { itemId } = body;
        if (!itemId) {
          return NextResponse.json(
            { success: false, error: "itemId is required" },
            { status: 400 },
          );
        }
        const deleted = deleteInventoryItem(itemId);
        if (!deleted) {
          return NextResponse.json(
            { success: false, error: `Item with id ${itemId} not found` },
            { status: 404 },
          );
        }
        return NextResponse.json({
          success: true,
          message: "Item deleted successfully",
        });
      }

      case "register_facility": {
        const { facility } = body;
        if (
          !facility ||
          !facility.name ||
          !facility.type ||
          !facility.phone ||
          !facility.operatingHours ||
          !facility.landmarkDirections
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "Facility requires name, type, phone, operatingHours, and landmarkDirections",
            },
            { status: 400 },
          );
        }

        const stepByStep =
          Array.isArray(facility.stepByStepLandmarks) &&
          facility.stepByStepLandmarks.length > 0
            ? facility.stepByStepLandmarks
            : [facility.landmarkDirections];

        const newFacility = addFacility({
          name: facility.name.trim(),
          type: facility.type as FacilityType,
          licenseNumber:
            facility.licenseNumber?.trim() || "PENDING-VERIFICATION",
          phone: facility.phone.trim(),
          email: facility.email?.trim() || "contact@facility.org",
          operatingHours: facility.operatingHours.trim(),
          address: facility.address?.trim() || "Nigeria",
          city: facility.city?.trim() || "Abuja",
          state: facility.state?.trim() || "FCT",
          landmarkDirections: facility.landmarkDirections.trim(),
          stepByStepLandmarks: stepByStep,
          emergencyContact:
            facility.emergencyContact?.trim() || facility.phone.trim(),
        });

        return NextResponse.json(
          {
            success: true,
            message: "Facility onboarded successfully",
            facility: newFacility,
          },
          { status: 201 },
        );
      }

      case "reset_seed": {
        resetInventoryToSeed();
        return NextResponse.json({
          success: true,
          message: "Inventory reset to initial seed data",
          facilities: getAllFacilities(),
          metrics: getFacilityMetrics(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Inventory POST API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while processing request",
      },
      { status: 500 },
    );
  }
}
