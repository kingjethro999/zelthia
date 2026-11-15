(self.webpackChunkopen_fda_gov = self.webpackChunkopen_fda_gov || []).push([
  [3396],
  {
    3256: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"application_number":{"pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"openfda":{"type":"object","properties":{"application_number":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","possible_values":null}},"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"generic_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Generic name(s) of the drug product.","possible_values":null}},"manufacturer_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Name of manufacturer or company that makes this drug product, corresponding to the labeler code segment of the NDC.","possible_values":null}},"nui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[N][0-9]{10}$","description":"Unique identifier applied to a drug concept within the National Drug File Reference Terminology (NDF-RT).","possible_values":{"type":"reference","value":{"name":"NDF-RT","link":"https://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/"}}}},"package_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","possible_values":null}},"pharm_class_cs":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Chemical structure classification of the drug product’s pharmacologic class. Takes the form of the classification, followed by `[Chemical/Ingredient]` (such as `Thiazides [Chemical/Ingredient]` or `Antibodies, Monoclonal [Chemical/Ingredient].","possible_values":null}},"pharm_class_epc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Established pharmacologic class associated with an approved indication of an active moiety (generic drug) that the FDA has determined to be scientifically valid and clinically meaningful. Takes the form of the pharmacologic class, followed by `[EPC]` (such as `Thiazide Diuretic [EPC]` or `Tumor Necrosis Factor Blocker [EPC]`.","possible_values":null}},"pharm_class_pe":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Physiologic effect or pharmacodynamic effect—tissue, organ, or organ system level functional activity—of the drug’s established pharmacologic class. Takes the form of the effect, followed by `[PE]` (such as `Increased Diuresis [PE]` or `Decreased Cytokine Activity [PE]`.","possible_values":null}},"pharm_class_moa":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Mechanism of action of the drug—molecular, subcellular, or cellular functional activity—of the drug’s established pharmacologic class. Takes the form of the mechanism of action, followed by `[MoA]` (such as `Calcium Channel Antagonists [MoA]` or `Tumor Necrosis Factor Receptor Blocking Activity [MoA]`.","possible_values":null}},"product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}$","description":"The labeler manufacturer code and product code segments of the NDC number, separated by a hyphen.","possible_values":null}},"route":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The route of administation of the drug product.","possible_values":{"type":"reference","value":{"name":"Route of administration","link":"http://www.fda.gov/ForIndustry/DataStandards/StructuredProductLabeling/ucm162034.htm"}}}},"rxcui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{6}$","description":"The RxNorm Concept Unique Identifier. RxCUI is a unique number that describes a semantic concept about the drug product, including its ingredients, strength, and dose forms.","possible_values":{"type":"reference","value":{"name":"RxNorm and RxCUI documentation","link":"https://www.nlm.nih.gov/research/umls/rxnorm/docs/2012/rxnorm_doco_full_2012-3.html"}}}},"spl_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for a particular version of a Structured Product Label for a product. Also referred to as the document ID.","possible_values":null}},"spl_set_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for the Structured Product Label for a product, which is stable across versions of the label. Also referred to as the set ID.","possible_values":null}},"substance_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The list of active ingredients of a drug product.","possible_values":null}},"unii":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[A-Z0-9]{10}$","description":"Unique Ingredient Identifier, which is a non-proprietary, free, unique, unambiguous, non-semantic, alphanumeric identifier based on a substance’s molecular structure and/or descriptive information.","possible_values":{"type":"reference","value":{"name":"Unique Ingredient Identifiers","link":"http://fdasis.nlm.nih.gov/srs/srs.jsp"}}}}}},"products":{"type":"object","description":"Information about the drug products.","properties":{"active_ingredients":{"type":"object","properties":{"name":{"description":"The names of the active, medicinal ingredients in the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"strength":{"description":"The strength of the active, medicinal ingredients in the drug product.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"dosage_form":{"description":"The drug’s dosage form. There is no standard, but values may include terms like `tablet` or `solution for injection`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"marketing_status":{"description":"Indicates how a drug product is sold in the United States.","format":null,"is_exact":false,"type":"string","possible_values":{"type":"one_of","value":{"1":"Prescription","2":"Discontinued","3":"None (Tentative Approval)","4":"Over-the-counter"}}},"product_number":{"description":"A product number is assigned to each drug product associated with an NDA (New Drug Application), ANDA (Abbreviated New Drug Application) and Biologic License Application (BLA) .  If a drug product is available in multiple strengths, there are multiple product numbers.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reference_drug":{"description":"Indicates whether the drug product is a reference drug.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reference_standard":{"description":"Indicates whether the drug product is a reference standard.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"route":{"description":"The route of administation of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"te_code":{"description":"The coding system for therapeutic equivalence evaluations allows users to determine whether FDA has evaluated a particular approved product as therapeutically equivalent to other pharmaceutically equivalent products (first letter) and to provide additional information on the basis of FDA\'s evaluations (second letter).","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"sponsor_name":{"description":"The company that submitted an application to FDA for approval to market the drug product in the United States.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"submissions":{"type":"object","description":"Submissions are used to group supporting documents relative to an application. A submission belongs to only one specific application. There must be at least one submission for each application.","properties":{"submission_property_type":{"type":"array","items":{"code":{"description":"The code indicating the submission property type.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"application_docs":{"type":"array","items":{"id":{"description":"The id of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"date":{"description":"The date of publication of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"title":{"description":"The title of the applications document.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":{"description":"The type of the applications document.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"url":{"description":"The url to access the applications document.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"review_priority":{"description":"Pending.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_class_code":{"description":"The Submission Classification Code, previously known as the Chemistry Classification Code, is assigned as a “Type” code.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_class_code_description":{"description":"The Submission Classification Code, previously known as the Chemistry Classification Code, is assigned as a “Type” code. This is a full description of the classification code.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_number":{"description":"A unique identifier for each submission under that application.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_public_notes":{"description":"Publicly available notes regarding the submission.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_status":{"description":"The current status of this submission.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"submission_status_date":{"description":"The date the status was applied to the submission.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"submission_type":{"description":"The type of the individual submission. Used in combination with submission_number.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}}},"type":"object"}',
      );
    },
    10718: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"package_ndc":{"format":null,"is_exact":false,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","possible_values":null},"generic_name":{"description":"Generic name(s) of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"proprietary_name":{"description":"Brand or trade name of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"company_name":{"description":"Company name that makes this drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"contact_info":{"description":"Contact information","format":null,"is_exact":true,"possible_values":null,"type":"string"},"presentation":{"description":"Drug name, form, strength, and NDC number","format":null,"is_exact":true,"possible_values":null,"type":"string"},"update_type":{"description":"Type of update","format":null,"is_exact":false,"possible_values":null,"type":"string"},"availability":{"description":"Availability Information","format":null,"is_exact":false,"possible_values":null,"type":"string"},"related_info":{"description":"Specific availability information for the presentation","format":null,"is_exact":true,"possible_values":null,"type":"string"},"related_info_link":{"description":"FDA resources and links","format":null,"is_exact":false,"possible_values":null,"type":"string"},"resolved_note":{"description":"Information related to the resolved status of the presentation","format":null,"is_exact":false,"possible_values":null,"type":"string"},"shortage_reason":{"description":"Reason for shortage of the presentation","format":null,"is_exact":true,"possible_values":null,"type":"string"},"therapeutic_category":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Therapeutic category","possible_values":null}},"dosage_form":{"description":"The drug’s dosage form. There is no standard, but values may include terms like `tablet` or `solution for injection`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"strength":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Drug strength","possible_values":null}},"status":{"description":"Presentation shortage status","format":null,"is_exact":false,"possible_values":null,"type":"string"},"update_date":{"description":"Date of update for the presentation","format":"date","is_exact":false,"pattern":"YYYYmmdd","type":"string"},"change_date":{"description":"Date of update for the presentation","format":"date","is_exact":false,"pattern":"YYYYmmdd","type":"string"},"discontinued_date":{"description":"Date the presentation was discontinued","format":"date","is_exact":false,"pattern":"YYYYmmdd","type":"string"},"initial_posting_date":{"description":"Date the presentation was added to the public website","format":"date","is_exact":false,"pattern":"YYYYmmdd","type":"string"},"openfda":{"type":"object","properties":{"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"dosage_form":{"type":"array","items":{"description":"The drug’s dosage form. There is no standard, but values may include terms like `tablet` or `solution for injection`.","format":null,"is_exact":true,"possible_values":null,"type":"string","generic_name":null}},"is_original_packager":{"type":"array","items":{"description":"Whether or not the drug has been repackaged for distribution.","format":null,"is_exact":true,"possible_values":null,"type":"string"}},"manufacturer_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Name of manufacturer or company that makes this drug product, corresponding to the labeler code segment of the NDC.","possible_values":null}},"nui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[N][0-9]{10}$","description":"Unique identifier applied to a drug concept within the National Drug File Reference Terminology (NDF-RT).","possible_values":{"type":"reference","value":{"name":"NDF-RT","link":"https://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/"}}}},"original_packager_product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This ndc identifies the original packager.","possible_values":null}},"package_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","possible_values":null}},"pharm_class_cs":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Chemical structure classification of the drug product’s pharmacologic class. Takes the form of the classification, followed by `[Chemical/Ingredient]` (such as `Thiazides [Chemical/Ingredient]` or `Antibodies, Monoclonal [Chemical/Ingredient].","possible_values":null}},"pharm_class_epc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Established pharmacologic class associated with an approved indication of an active moiety (generic drug) that the FDA has determined to be scientifically valid and clinically meaningful. Takes the form of the pharmacologic class, followed by `[EPC]` (such as `Thiazide Diuretic [EPC]` or `Tumor Necrosis Factor Blocker [EPC]`.","possible_values":null}},"pharm_class_moa":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Mechanism of action of the drug—molecular, subcellular, or cellular functional activity—of the drug’s established pharmacologic class. Takes the form of the mechanism of action, followed by `[MoA]` (such as `Calcium Channel Antagonists [MoA]` or `Tumor Necrosis Factor Receptor Blocking Activity [MoA]`.","possible_values":null}},"pharm_class_pe":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Physiologic effect or pharmacodynamic effect—tissue, organ, or organ system level functional activity—of the drug’s established pharmacologic class. Takes the form of the effect, followed by `[PE]` (such as `Increased Diuresis [PE]` or `Decreased Cytokine Activity [PE]`.","possible_values":null}},"product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}$","description":"The labeler manufacturer code and product code segments of the NDC number, separated by a hyphen.","possible_values":null}},"product_type":{"type":"array","items":{"description":"Type of drug product","format":null,"is_exact":true,"possible_values":null,"type":"string"}},"route":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The route of administation of the drug product.","possible_values":{"type":"reference","value":{"name":"Route of administration","link":"http://www.fda.gov/ForIndustry/DataStandards/StructuredProductLabeling/ucm162034.htm"}}}},"rxcui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{6}$","description":"The RxNorm Concept Unique Identifier. RxCUI is a unique number that describes a semantic concept about the drug product, including its ingredients, strength, and dose forms.","possible_values":{"type":"reference","value":{"name":"RxNorm and RxCUI documentation","link":"https://www.nlm.nih.gov/research/umls/rxnorm/docs/2012/rxnorm_doco_full_2012-3.html"}}}},"spl_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for a particular version of a Structured Product Label for a product. Also referred to as the document ID.","possible_values":null}},"spl_set_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for the Structured Product Label for a product, which is stable across versions of the label. Also referred to as the set ID.","possible_values":null}},"substance_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The list of active ingredients of a drug product.","possible_values":null}},"unii":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[A-Z0-9]{10}$","description":"Unique Ingredient Identifier, which is a non-proprietary, free, unique, unambiguous, non-semantic, alphanumeric identifier based on a substance’s molecular structure and/or descriptive information.","possible_values":{"type":"reference","value":{"name":"Unique Ingredient Identifiers","link":"http://fdasis.nlm.nih.gov/srs/srs.jsp"}}}},"upc":{"type":"array","items":{"type":"string","description":"Universal Product Code","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"Universal Product Code","link":"https://en.wikipedia.org/wiki/Universal_Product_Code"}}}}}},"type":"object"}}',
      );
    },
    20991: function (e, t, i) {
      "use strict";
      var a = i(96540),
        n = i(99634),
        r = i.n(n),
        s = { borderRadius: "3px", padding: "2px 5px" };
      t.A = function (e) {
        var t = e.values,
          i = Object.keys(t.value),
          n = r()({
            "col marg-b-1": !0,
            "t-3": i.length >= 11,
            "t-6": i.length <= 10,
          });
        return "one_of" === t.type
          ? a.createElement(
              "div",
              { className: "row marg-t-2" },
              a.createElement(
                "div",
                {
                  className:
                    "bg-primary-alt-lightest clr-gray inline-block sans weight-600 small marg-b-1",
                  style: s,
                },
                "Value is one of the following",
              ),
              a.createElement(
                "ul",
                { className: "flex-box flex-wrap" },
                i.map(function (e, i) {
                  return a.createElement(
                    "li",
                    { className: n, key: i },
                    a.createElement(
                      "p",
                      { className: "no-marg" },
                      a.createElement("code", null, e),
                      " = ",
                      t.value[e],
                    ),
                  );
                }),
              ),
            )
          : "reference" === t.type
            ? a.createElement(
                "div",
                { className: "row marg-t-2" },
                a.createElement(
                  "p",
                  null,
                  "Fore more information, see ",
                  a.createElement(
                    "a",
                    {
                      className: "link-external",
                      href: t.value.link,
                      rel: "noopener noreferrer",
                      target: "_blank",
                    },
                    t.value.name,
                  ),
                ),
              )
            : a.createElement("noscript", null);
      };
    },
    30632: function (e, t, i) {
      "use strict";
      var a = i(96540),
        n = i(95909),
        r = i(20539),
        s = i(67419),
        o = i(47978),
        l = i(48192),
        c = i(43906),
        u = i(89623),
        d = i(89442),
        p = i(44718),
        f = i(70783),
        m = i(3256),
        h = i(10718),
        g = i(20991);
      function y(e) {
        return (
          (y =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          y(e)
        );
      }
      function _(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var i =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != i) {
              var a,
                n,
                r,
                s,
                o = [],
                l = !0,
                c = !1;
              try {
                if (((r = (i = i.call(e)).next), 0 === t)) {
                  if (Object(i) !== i) return;
                  l = !1;
                } else
                  for (
                    ;
                    !(l = (a = r.call(i)).done) &&
                    (o.push(a.value), o.length !== t);
                    l = !0
                  );
              } catch (e) {
                ((c = !0), (n = e));
              } finally {
                try {
                  if (
                    !l &&
                    null != i.return &&
                    ((s = i.return()), Object(s) !== s)
                  )
                    return;
                } finally {
                  if (c) throw n;
                }
              }
              return o;
            }
          })(e, t) ||
          (function (e, t) {
            if (e) {
              if ("string" == typeof e) return b(e, t);
              var i = {}.toString.call(e).slice(8, -1);
              return (
                "Object" === i && e.constructor && (i = e.constructor.name),
                "Map" === i || "Set" === i
                  ? Array.from(e)
                  : "Arguments" === i ||
                      /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)
                    ? b(e, t)
                    : void 0
              );
            }
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function b(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var i = 0, a = Array(t); i < t; i++) a[i] = e[i];
        return a;
      }
      function v(e, t) {
        for (var i = 0; i < t.length; i++) {
          var a = t[i];
          ((a.enumerable = a.enumerable || !1),
            (a.configurable = !0),
            "value" in a && (a.writable = !0),
            Object.defineProperty(e, w(a.key), a));
        }
      }
      function w(e) {
        var t = (function (e, t) {
          if ("object" != y(e) || !e) return e;
          var i = e[Symbol.toPrimitive];
          if (void 0 !== i) {
            var a = i.call(e, t || "default");
            if ("object" != y(a)) return a;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return ("string" === t ? String : Number)(e);
        })(e, "string");
        return "symbol" == y(t) ? t : t + "";
      }
      function A(e, t, i) {
        return (
          (t = k(t)),
          (function (e, t) {
            if (t && ("object" == y(t) || "function" == typeof t)) return t;
            if (void 0 !== t)
              throw new TypeError(
                "Derived constructors may only return object or undefined",
              );
            return (function (e) {
              if (void 0 === e)
                throw new ReferenceError(
                  "this hasn't been initialised - super() hasn't been called",
                );
              return e;
            })(e);
          })(
            e,
            x()
              ? Reflect.construct(t, i || [], k(e).constructor)
              : t.apply(e, i),
          )
        );
      }
      function x() {
        try {
          var e = !Boolean.prototype.valueOf.call(
            Reflect.construct(Boolean, [], function () {}),
          );
        } catch (e) {}
        return (x = function () {
          return !!e;
        })();
      }
      function k(e) {
        return (
          (k = Object.setPrototypeOf
            ? Object.getPrototypeOf.bind()
            : function (e) {
                return e.__proto__ || Object.getPrototypeOf(e);
              }),
          k(e)
        );
      }
      function D(e, t) {
        return (
          (D = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return ((e.__proto__ = t), e);
              }),
          D(e, t)
        );
      }
      var T = (function (e) {
        function t(e) {
          var i;
          (!(function (e, t) {
            if (!(e instanceof t))
              throw new TypeError("Cannot call a class as a function");
          })(this, t),
            (i = A(this, t, [e])));
          var a = e.master_harmonization,
            n = [],
            r = "";
          return (
            Object.keys(a).forEach(function (e) {
              var t = !Array.isArray(a[e]) || 0 === a[e].length;
              (Object.values(a[e]).forEach(function (e) {
                Array.isArray(e) && e.length && (t = !1);
              }),
                !1 === t && n.push(e));
            }),
            (r = i.props.selected_noun ? i.props.selected_noun : n[0]),
            (i.state = { columns: [], data: {}, nouns: n, selected_noun: r }),
            (i.onChangeNoun = i.onChangeNoun.bind(i)),
            i
          );
        }
        return (
          (function (e, t) {
            if ("function" != typeof t && null !== t)
              throw new TypeError(
                "Super expression must either be null or a function",
              );
            ((e.prototype = Object.create(t && t.prototype, {
              constructor: { value: e, writable: !0, configurable: !0 },
            })),
              Object.defineProperty(e, "prototype", { writable: !1 }),
              t && D(e, t));
          })(t, e),
          (i = t),
          (y = [
            {
              key: "componentDidMount",
              value: function () {
                this.getData();
              },
            },
            {
              key: "componentDidUpdate",
              value: function (e, t) {
                t.selected_noun !== this.state.selected_noun && this.getData();
              },
            },
            {
              key: "fieldDefinitionTooltip",
              value: function (e) {
                var t, i, r;
                if (null == e) return a.createElement("span", null);
                var s = {
                    device510k: o,
                    deviceclassification: l,
                    devicepma: c,
                    devicerecall: u,
                    drugdrugsfda: m,
                    drugenforcement: d,
                    druglabel: p,
                    drugndc: f,
                    drugdrugshortages: h,
                  },
                  y = e[0],
                  _ =
                    null === (t = s[e[1]]) ||
                    void 0 === t ||
                    null === (i = t.properties) ||
                    void 0 === i ||
                    null === (r = i.openfda) ||
                    void 0 === r
                      ? void 0
                      : r.properties[y],
                  b = "",
                  v = null,
                  w = "",
                  A = "",
                  x = "",
                  k = !1,
                  D = "col t-range-marg-t-2 marg-b-2 t-range-6";
                (_ &&
                  ((A = _.description),
                  (x = _.pattern),
                  (b = _.type),
                  (v = _.possible_values),
                  (k = _.is_exact && _.is_exact)),
                  _ &&
                    _.items &&
                    ((A = _.items.description),
                    (x = _.items.pattern),
                    (w = _.items.type),
                    (v = _.items.possible_values)));
                var T = v;
                return a.createElement(
                  "div",
                  { className: "fields-tooltip" },
                  a.createElement("h3", { className: "tooltip-header" }, y),
                  a.createElement(
                    "div",
                    { className: D },
                    a.createElement(
                      "pre",
                      { className: "pad-1 hljs-string inline-block" },
                      b,
                      w && " of ".concat(w, "s"),
                    ),
                  ),
                  a.createElement(
                    "div",
                    { className: D },
                    A &&
                      a.createElement("div", {
                        dangerouslySetInnerHTML: { __html: (0, n.xI)(A) },
                      }),
                    k &&
                      a.createElement(
                        "div",
                        null,
                        a.createElement(
                          "p",
                          null,
                          "This is an ",
                          a.createElement(
                            "code",
                            { className: "inline-block" },
                            ".exact",
                          ),
                          " field. It has been indexed both as its exact string content, and also tokenized.",
                        ),
                        a.createElement(
                          "ul",
                          null,
                          a.createElement(
                            "li",
                            { className: "bullet" },
                            a.createElement(
                              "p",
                              null,
                              a.createElement(
                                "code",
                                { className: "hljs-string inline-block" },
                                "search=",
                                y,
                                ':"FOO+BAR"',
                              ),
                              a.createElement("br", null),
                              "Searches for records where either ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "FOO",
                              ),
                              " or ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "BAR",
                              ),
                              " appear anywhere in this field.",
                            ),
                          ),
                          a.createElement(
                            "li",
                            { className: "bullet" },
                            a.createElement(
                              "p",
                              null,
                              a.createElement(
                                "code",
                                { className: "hljs-string inline-block" },
                                "search=",
                                y,
                                '.exact:"FOO+BAR"',
                              ),
                              a.createElement("br", null),
                              "Searches for records where exactly and only ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "FOO BAR",
                              ),
                              " appears in this field.",
                            ),
                          ),
                          a.createElement(
                            "li",
                            { className: "bullet" },
                            a.createElement(
                              "p",
                              null,
                              a.createElement(
                                "code",
                                { className: "hljs-string inline-block" },
                                "count=",
                                y,
                              ),
                              a.createElement("br", null),
                              "Counts the tokenized values of this field. Instances of ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "FOO",
                              ),
                              " and ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "BAR",
                              ),
                              " are counted separately.",
                            ),
                          ),
                          a.createElement(
                            "li",
                            { className: "bullet" },
                            a.createElement(
                              "p",
                              null,
                              a.createElement(
                                "code",
                                { className: "hljs-string inline-block" },
                                "count=",
                                y,
                                ".exact",
                              ),
                              a.createElement("br", null),
                              "Counts the exact values of this field. ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "FOO BAR",
                              ),
                              ", ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "BAR FOO",
                              ),
                              ", ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "FOO",
                              ),
                              ", and ",
                              a.createElement(
                                "code",
                                { className: "inline-block" },
                                "BAR",
                              ),
                              " would all be counted separately, along with other combinations that contain these terms.",
                            ),
                          ),
                        ),
                      ),
                    v &&
                      Object.keys(T.value).length <= 4 &&
                      a.createElement(g.A, { values: T }),
                    x &&
                      a.createElement(
                        "div",
                        null,
                        "Values follow this pattern",
                      ),
                    x &&
                      a.createElement(
                        "div",
                        { className: "row" },
                        a.createElement(
                          "pre",
                          { className: "inline-block pad-1" },
                          x,
                        ),
                      ),
                    v &&
                      Object.keys(T.value).length > 4 &&
                      a.createElement(
                        "div",
                        { className: "row" },
                        a.createElement(g.A, { values: T }),
                      ),
                  ),
                );
              },
            },
            {
              key: "getData",
              value: function () {
                for (
                  var e = this,
                    t = {
                      "510k": "510k",
                      classification: "Classification",
                      enforcement: "Enforcement",
                      event: "Event",
                      pma: "PMA",
                      recall: "Recall",
                      registrationlisting: "Registration",
                      udi: "UDI",
                      drugsfda: "Drugs@FDA",
                      label: "Label",
                      ndc: "NDC",
                      drugshortages: "Drug Shortages",
                      nsde: "NSDE",
                    },
                    i = [],
                    n = [
                      {
                        Header: "Field",
                        accessor: "field",
                        Cell: function (t) {
                          return a.createElement(
                            s.Tooltip,
                            {
                              arrow: !0,
                              html: e.fieldDefinitionTooltip(t.value),
                              interactive: !0,
                              position: "right",
                              theme: "light",
                              trigger: "mouseenter",
                            },
                            a.createElement("span", null, t.value[0]),
                          );
                        },
                        width: 242,
                      },
                    ],
                    r = {},
                    o = [],
                    l = this.state.selected_noun,
                    c = function () {
                      var e = _(d[u], 2),
                        s = e[0],
                        c = e[1];
                      Array.isArray(c) &&
                        c.length &&
                        c.forEach(function (e, c) {
                          var u, d, p;
                          (-1 === Object.keys(r).indexOf(e)
                            ? ((r[e] = o.length),
                              o.push(
                                ((u = { field: [e, l + s] }),
                                (p = !0),
                                ((d = w((d = s))) in u)
                                  ? Object.defineProperty(u, d, {
                                      value: p,
                                      enumerable: !0,
                                      configurable: !0,
                                      writable: !0,
                                    })
                                  : (u[d] = p),
                                u),
                              ))
                            : (o[r[e]][s] = !0),
                            -1 === i.indexOf(s) &&
                              (n.push({
                                Header: t[s],
                                accessor: s,
                                Cell: function (e) {
                                  return a.createElement(
                                    "div",
                                    { className: "checkbox-cell" },
                                    e.value
                                      ? a.createElement("i", {
                                          className: "fa fa-2x fa-check",
                                          style: { color: "green" },
                                        })
                                      : a.createElement("span", null),
                                  );
                                },
                              }),
                              i.push(s)));
                        });
                    },
                    u = 0,
                    d = Object.entries(
                      this.props.master_harmonization[this.state.selected_noun],
                    );
                  u < d.length;
                  u++
                )
                  c();
                this.setState({ columns: n, data: o });
              },
            },
            {
              key: "onChangeNoun",
              value: function (e) {
                var t = e.target.getAttribute("title");
                this.state.selected_noun !== t &&
                  this.setState({ selected_noun: t || "" });
              },
            },
            {
              key: "render",
              value: function () {
                var e = this;
                if (
                  0 === Object.keys(this.state.data).length &&
                  this.state.data.constructor === Object
                )
                  return a.createElement("span", null);
                var t = this.state.nouns.map(function (t) {
                  return a.createElement(
                    "div",
                    {
                      className:
                        e.state.selected_noun === t ? "selected" : "unselected",
                      id: "noun-button-" + t,
                      key: t,
                      onClick: function (t) {
                        return e.onChangeNoun(t);
                      },
                      title: t,
                    },
                    t.charAt(0).toUpperCase() + t.slice(1),
                  );
                });
                return a.createElement(
                  "section",
                  { id: "fields-harmonization" },
                  a.createElement(
                    "div",
                    { className: "noun-buttons", id: "noun-buttons" },
                    t,
                  ),
                  a.createElement(r.A, {
                    data: this.state.data,
                    columns: this.state.columns,
                    showPagination: !1,
                    minRows: 0,
                    defaultPageSize: 25,
                    className: "-striped -highlight",
                    resizable: !1,
                    style: {
                      width: "100%",
                      height: "494px",
                      position: "relative",
                    },
                  }),
                );
              },
            },
          ]),
          y && v(i.prototype, y),
          b && v(i, b),
          Object.defineProperty(i, "prototype", { writable: !1 }),
          i
        );
        var i, y, b;
      })(a.Component);
      t.A = T;
    },
    43906: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"advisory_committee":{"description":"This equates to the review division within CDRH in which the PMA would be reviewed, if it were reviewed today; this is derived from the procode and is always same as the “Review Panel” field in the Device Classification database (e.g. GU).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"AN":"Anesthesiology","CV":"Cardiovascular","CH":"Clinical Chemistry","DE":"Dental","EN":"Ear, Nose, Throat","GU":"Gastroenterology, Urology","HO":"General Hospital","HE":"Hematology","IM":"Immunology","MG":"Medical Genetics","MI":"Microbiology","NE":"Neurology","OB":"Obstetrics/Gynecology","OP":"Ophthalmic","OR":"Orthopedic","PA":"Pathology","PM":"Physical Medicine","RA":"Radiology","SU":"General, Plastic Surgery","TX":"Clinical Toxicology"}},"type":"string"},"advisory_committee_description":{"description":"Full spelling of the Advisory committee abbreviation (e.g. gastroenterology).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"ao_statement":{"description":"Approval order statement: a brief description of the reason for the supplement/application approval by FDA.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"applicant":{"description":"The manufacturer of record or third party who submits a PMA submission for clearance (also known as sponsor).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"city":{"description":"City of record of the applicant.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"date_received":{"description":"Date that the FDA Document Control Center received the submission.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"decision_code":{"description":"A four digit code reflecting the final decision for a PMA submission.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"APPR":"Approval: PMA has been approved.","WTDR":"Withdrawal: PMA has been withdrawn.","DENY":"Denial: PMA has been denied.","LE30":"30 day notice acceptance (decision made in ≤30 days).","APRL":"Reclassification after approval.","APWD":"Withdrawal after approval.","GT30":"No decision made in 30 days.","APCV":"Conversion after approval.      "}},"type":"string"},"decision_date":{"description":"This is the date that FDA rendered a decision on the status of a PMA submission (i.e. clearance).","format":"date","is_exact":false,"possible_values":null,"type":"string"},"docket_number":{"description":"The assigned posted docket number in the Federal Register.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"expedited_review_flag":{"description":"Flag indicating that the approval review process was expidited.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Yes","N":"No"}},"type":"string"},"fed_reg_notice_date":{"description":"Documentation forthcoming.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"generic_name":{"description":"Common or generic name as specified in the submission. Not to be confused with the official device nomenclature name related to the product code.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"openfda":{"properties":{"device_class":{"description":"A risk based classification system for all medical devices ((Federal Food, Drug, and Cosmetic Act, section 513)","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"Class I (low to moderate risk): general controls","2":"Class II (moderate to high risk): general controls and special controls","3":"Class III (high risk): general controls and Premarket Approval (PMA)","U":"Unclassified","N":"Not classified","F":"HDE"}},"type":"string"},"device_name":{"description":"This is the proprietary name, or trade name, of the cleared device.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"fei_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"medical_specialty_description":{"description":"Regulation Medical Specialty is assigned based on the regulation (e.g. 21 CFR Part 888 is Orthopedic Devices) which is why Class 3 devices lack the “Regulation Medical Specialty” field.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"registration_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"regulation_number":{"items":{"description":"The classification regulation in the Code of Federal Regulations (CFR) under which the device is identified, described, and formally classified (Code of Federal regulations Title 21, 862.00 through 892.00). The classification regulation covers various aspects of design, clinical evaluation, manufacturing, packaging, labeling, and postmarket surveillance of the specific medical device.","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"CFR database","link":"http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm"}},"type":"string"},"type":"array"}},"type":"object"},"pma_number":{"description":"FDA-assigned premarket application number, including leading letters. Leading letter “D” indicates Product Development Protocol type of Premarket Approval. Leading letters “BP” indicates Premarket Approval by Center for Biologics Evaluation and Research. Leading letter “H” indicates Humanitarian Device Exemption approval. Leading letter “N” indicates New Drug Application. Early PMAs were approved as NDAs. Leading letter “P” indicates Premarket Approval.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_code":{"description":"A three-letter identifier assigned to a device category. Assignment is based upon the medical device classification designated under 21 CFR Parts 862-892, and the technology and intended use of the device. Occasionally these codes are changed over time.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"state":{"description":"Portion of address that designates the state of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"street_1":{"description":"Delivery address of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"street_2":{"description":"Delivery address of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"supplement_number":{"description":"FDA assigned supplement number.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"supplement_reason":{"description":"General description for the reason for the supplement or application.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"supplement_type":{"description":"[Link to general criteria used for PMA regulation](http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=814). The “PMA regulation” (21 CFR Part 814) sets forth general criteria for determining when you must submit a PMA supplement or a 30-day notice for a device modification or manufacturing change (21 CFR 814.39). See [here](http://www.fda.gov/MedicalDevices/DeviceRegulationandGuidance/HowtoMarketYourDevice/PremarketSubmissions/PremarketApprovalPMA/ucm050467.htm#types) for more detail.","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"Subpart B":"“Premarket Approval Application” of the PMA regulation in Part 814 describes PMA amendments and supplements.","Subpart E":"“Post Approval Requirements” describes requirements for continuing evaluation (post-approval studies), periodic reporting, and other requirements related to the continued reasonable assurance of safety and effectiveness of an approved PMA device. The Act defines different types of PMA supplements that are used to request approval of a change to a device that has an approved PMA (see section 737(4) of the Act (21 U.S.C. 379i(4)) for definitions of 180-day supplements, real-time supplements, panel-track supplements).","PMA supplement (180 days)":"Per section 737(4)(C) of the Act (21 U.S.C. 379i(4)(C)), this is a supplement to an approved premarket application or premarket report under section 515 that is not a panel-track supplement and requests a significant change in components, materials, design, specification, software, color additives, or labeling.","Special PMA Supplement":"Changes Being Effected Sections 21 CFR 814.39(d)(1) and (d)(2)provide that certain labeling and manufacturing changes that enhance the safety of the device or the safety in the use of the device may be submitted as a supplement marked “Special PMA Supplement – Changes Being Effected.” The Special PMA Supplement is a narrow exception to the general rule that prior FDA approval of changes to a PMA, including the labeling for a device, is a condition of lawful distribution and, therefore, may only be utilized when (1) the applicant has newly acquired safety-related information; (2) the information in question was not previously submitted to the FDA; and (3) the information involves labeling changes that add or strengthen a contraindication, warning, precaution, or information about an adverse reaction for which there is reasonable evidence of a causal association.","30-day Notice and 135 PMA Supplement":"Section 515(d) of the Act (21 U.S.C. 360e), as amended by the Food and Drug Administration Modernization Act of 1997 (FDAMA)(Pub. L. 105-115), permits a PMA applicant to submit written notification to the agency of a modification to the manufacturing procedure or method of manufacture affecting the safety and effectiveness of the device rather than submitting such change as a PMA supplement. The applicant may distribute the device 30 days after the date on which FDA receives the notice, unless FDA finds such information in the 30-day notice is not adequate, notifies the applicant that the submission has been converted to a 135-day supplement (21 CFR 814.39(f)), and describes further information or action that is required for acceptance of the modification.","PMA Manufacturing Site Change Supplement":"After approval of a PMA, an applicant shall submit a PMA supplement for review and approval by FDA before making a change that affects the safety or effectiveness of the device, including a change that uses a different facility or establishment to manufacture, process, or package the device. Such a PMA supplement for a move to a different facility or establishment is called a “manufacturing site change supplement.”","Annual (periodic) Report or 30-day Supplements":"In accordance with 21 CFR 814.82(a)(7), FDA may require as a condition of approval submission to FDA at intervals specified in the approval order of periodic reports containing the information required by 21 CFR 814.84(b). In most cases, after the PMA is approved, the PMA applicant is required to submit reports to FDA annually unless a different time frame is specified in the approval order.","PMA":"Any premarket approval application for a class III medical device, including all information submitted with or incorporated by reference."}},"type":"string"},"trade_name":{"description":"This is the proprietary name of the approved device.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"zip":{"description":"Portion of address that designates the zip code of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"zip_ext":{"description":"Portion of address that designates the “speed zip” or the “+4” of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"}},"type":"object"}',
      );
    },
    47978: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"address_1":{"description":"Delivery address of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"address_2":{"description":"Delivery address of the applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"advisory_committee":{"description":"Code under which the product was originally classified, based on the product code. This is a historical designation for the group that initially placed a device into Class I, Class II, or Class III following the medical device amendments of May 28, 1976. Two letters indicate the medical specialty panel that was responsible for classifying the product (e.g. GU).","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"AN":"Anesthesiology","CV":"Cardiovascular","CH":"Clinical Chemistry","DE":"Dental","EN":"Ear, Nose, Throat","GU":"Gastroenterology, Urology","HO":"General Hospital","HE":"Hematology","IM":"Immunology","MG":"Medical Genetics","MI":"Microbiology","NE":"Neurology","OB":"Obstetrics/Gynecology","OP":"Ophthalmic","OR":"Orthopedic","PA":"Pathology","PM":"Physical Medicine","RA":"Radiology","SU":"General, Plastic Surgery","TX":"Clinical Toxicology"}},"type":"string"},"advisory_committee_description":{"description":"Full spelling of the Advisory Committee abbreviation (e.g. Gastroenterology and Urology Devices Panel of the Medical Devices Advisory Committee). (note that `&` and `and` have been removed from the descriptions as they conflicted with the API syntax)","format":null,"is_exact":true,"possible_values":null,"type":"string"},"applicant":{"description":"The manufacturer of record or third party who submits a 510(k) submission. Also known as sponsor. Please note, before Aug 14, 2014, this could be either the manufacturer who submitted the 510k, the third party OR the consultant; after Aug 14, 2014, it is always the manufacturer.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"city":{"description":"City of the delivery address of the applicant.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"clearance_type":{"description":"Denotes the submission method utilized for the submission of the 510(k).","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"traditional":"Traditional","special":"Special","post":"Post","nse":"NSE","direct":"Direct","track":"Track","dual":"Dual"}},"type":"string"},"contact":{"description":"Per 21 CFR 807.3(e), this is the official correspondent designated by the owner or operator of an establishment as responsible for the following: (1) The annual registration of the establishment and (2) Contact with the Food and Drug Administration for device listing; and (3) Maintenance and submission of a current list of officers and directors to the Food and Drug Administration upon the request of the Commissioner; and (4) The receipt of pertinent correspondence from the Food and Drug Administration directed to and involving the owner or operator and/or any of the firm’s : establishments; and (5) The annual certification of medical device reports required by 804.30 of this chapter or forwarding the certification form to the person designated by the firm as responsible for the certification. For 510ks received before Aug 14, 2014, this could be either the contact from the manufacturer who submitted the 510k, the third party OR the consultant; after Aug 14, 2014, it is always the Applicant (manufacturer)","format":null,"is_exact":true,"possible_values":null,"type":"string"},"country_code":{"description":"The numeric 2 character code (ISO 3166-1 alpha-2) that designates the country of a postal delivery location (also known as country code).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"date_received":{"description":"Date that the FDA Document Control Center received the submission.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"decision_code":{"description":"Four letter codes that denote the specific substantial equivalence decision rendered by FDA on a specific 510(k).","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"SEKD":"Substantially Equivalent - Kit with Drugs","SESD":"Substantially Equivalent with Drug","SESE":"Substantially Equivalent","SESK":"Substantially Equivalent - Kit","SESP":"Substantially Equivalent - Postmarket Surveillance Required","SESU":"Substantially Equivalent - With Limitations","SESR":"Potential Recall"}},"type":"string"},"decision_date":{"description":"This is the date on which FDA rendered a final decision on a 510(k) submission.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"decision_description":{"description":"This is the full spelling associated with the abbreviated decision code (e.g. Substantially Equivalent - Postmarket Surveillance Required).","format":null,"is_exact":false,"possible_values":null,"type":"string"},"device_name":{"description":"This is the proprietary name of the cleared device (trade name).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"expedited_review_flag":{"description":"Qualifying products are eligible for ‘priority review’ by CDRH in one of four possible review tracks if it is intended to treat or diagnose a life-threatening or irreversibly debilitating disease or condition and is: (1) A breakthrough technology or; (2) there is no alternative means of treatment or diagnosis; or (3) The device offers significant, clinically meaningful advantages over existing approved alternatives; or (4) the availability of the device is in the best interest of patients.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"k_number":{"description":"FDA-assigned premarket notification number, including leading letters. Leading letters “BK” indicates 510(k) clearance, or Premarket Notification, cleared by Center for Biologics Evaluation and Research. Leading letters “DEN” indicates De Novo, or Evaluation of Automatic Class III Designation. Leading letter “K” indicates 510(k) clearance, or Premarket Notification.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"openfda":{"properties":{"device_class":{"description":"A risk based classification system for all medical devices ((Federal Food, Drug, and Cosmetic Act, section 513)","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"Class I (low to moderate risk): general controls","2":"Class II (moderate to high risk): general controls and special controls","3":"Class III (high risk): general controls and Premarket Approval (PMA)","U":"Unclassified","N":"Not classified","F":"HDE"}},"type":"string"},"device_name":{"description":"This is the proprietary name, or trade name, of the cleared device.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"fei_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"medical_specialty_description":{"description":"Regulation Medical Specialty is assigned based on the regulation (e.g. 21 CFR Part 888 is Orthopedic Devices) which is why Class 3 devices lack the “Regulation Medical Specialty” field.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"registration_number":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"regulation_number":{"items":{"description":"The classification regulation in the Code of Federal Regulations (CFR) under which the device is identified, described, and formally classified (Code of Federal regulations Title 21, 862.00 through 892.00). The classification regulation covers various aspects of design, clinical evaluation, manufacturing, packaging, labeling, and postmarket surveillance of the specific medical device.","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"CFR database","link":"http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm"}},"type":"string"},"type":"array"}},"type":"object"},"postal_code":{"description":"A series of letters and/or digits, sometimes including spaces or punctuation, included in a postal address for the purpose of sorting mail. In the United States, this is a Zip code (below).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"product_code":{"description":"A three-letter identifier assigned to a device category. Assignment is based upon the medical device classification designated under 21 CFR Parts 862-892, and the technology and intended use of the device. Occasionally these codes are changed over time.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"review_advisory_committee":{"description":"Known as the “510(k) Review Panel” since 2014, this helps define the review division within CDRH in which the 510(k) would be reviewed, if it were reviewed today; this is derived from the procode and is always the same as the “Review Panel” field in the Device Classification database.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"state":{"description":"This is the state of record of U.S. based applicants.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"statement_or_summary":{"description":"A statement or summary can be provided per 21 CFR 807.3(n) and (o). A 510(k) summary, submitted under section 513(i) of the act, of the safety and effectiveness information contained in a premarket notification submission upon which a determination of substantial equivalence can be based. Safety and effectiveness information refers to safety and effectiveness data and information supporting a finding of substantial equivalence, including all adverse safety and effectiveness. The 510(k) Statement is a statement, made under section 513(i) of the act, asserting that all information in a premarket notification submission regarding safety and effectiveness will be made available within 30 days of request by any person if the device described in the premarket notification submission is determined to be substantially equivalent. The information to be made available will be a duplicate of the premarket notification submission, including any adverse safety and effectiveness information, but excluding all patient identifiers, and trade secret or confidential commercial information, as defined in 21 CFR 20.61.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"third_party_flag":{"description":"Eligibility for a manufacturer to utilize a contracted Accredited Person in lieu of direct submission to FDA yielding a streamlined review process. Criteria in section 523(b)(3) of 21 U.S.C. 360m(b).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Yes","N":"No"}},"type":"string"},"zip_code":{"description":"Portion of address that designates the U.S. zip code of applicant.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"meta":{"format":null,"type":"object","description":"This section contains a disclaimer and license information. The field `last_updated` indicates when the data files were exported.","possible_values":null,"properties":{"type":"object","disclaimer":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Important details notes about openFDA data and limitations of the dataset.","possible_values":null},"license":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Link to a web page with license terms that govern data within openFDA.","possible_values":null},"last_updated":{"format":"date","is_exact":false,"type":"string","pattern":null,"description":"The last date when this openFDA endpoint was updated. Note that this does not correspond to the most recent record for the endpoint or dataset. Rather, it is the last time the openFDA API was itself updated.","possible_values":null},"results":{"type":"object","properties":{"skip":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Offset (page) of results, defined by the `skip` [query parameter](/api/).","possible_values":null},"limit":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Number of records in this return, defined by the `limit` [query parameter](/api/). If there is no `limit` parameter, the API returns one result.","possible_values":null},"total":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Total number of records matching the search criteria.","possible_values":null}}}}}},"type":"object"}',
      );
    },
    48192: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"definition":{"description":"Compositional definition of a medical device, based on the input of nomenclature experts, incorporating the definition of components of a device.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"device_class":{"description":"A risk based classification system for all medical devices ((Federal Food, Drug, and Cosmetic Act, section 513).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"Class I (low to moderate risk): general controls","2":"Class II (moderate to high risk): general controls and special controls","3":"Class III (high risk): general controls and Premarket Approval (PMA)","U":"Unclassified","N":"Not classified","F":"HDE"}},"type":"string"},"device_name":{"description":"This is the proprietary name, or trade name, of the cleared device","format":null,"is_exact":true,"possible_values":null,"type":"string"},"gmp_exempt_flag":{"description":"An indication the device is exempt from Good Manufacturing Processes CFR 820. U.S. zip code of the Applicant. See [here](http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpcd/315.cfm) for more detail.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Exempt due to Good Manufacturing Practice (GMP)/Quality System","N":"Not exempt due to Good Manufacturing Practice (GMP)/Quality System"}},"type":"string"},"implant_flag":{"description":"An indicator that the device is placed into a surgically or naturally formed cavity of the human body. Intended to remain implanted for 30 days or more; or the Commissioner makes a determination (that the device is to be considered implanted).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Device is implantable","N":"Device is not implantable"}},"type":"string"},"life_sustain_support_flag":{"description":"An indicator that the device is essential to, or yields information that is essential to, the restoration or continuation of a bodily function important to the continuation of human life.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Device is used for life sustaining purposes.","N":"Device is not used for life sustaining purposes"}},"type":"string"},"medical_specialty":{"description":"Regulation Medical Specialty is assigned based on the regulation (e.g. 21 CFR Part 888 is Orthopedic Devices) which is why Class 3 devices lack the “Regulation Medical Specialty” field. Two letters indicating the medical specialty panel responsible for reviewing the product. See [link](http://www.fda.gov/MedicalDevices/DeviceRegulationandGuidance/Overview/ClassifyYourDevice/ucm051668.htm#medicalspecialty) for further detail.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"AN":"Anesthesiology","CV":"Cardiovascular","CH":"Clinical Chemistry","DE":"Dental","EN":"Ear, Nose, Throat","GU":"Gastroenterology, Urology","HO":"General Hospital","HE":"Hematology","IM":"Immunology","MG":"Medical Genetics","MI":"Microbiology","NE":"Neurology","OB":"Obstetrics/Gynecology","OP":"Ophthalmic","OR":"Orthopedic","PA":"Pathology","PM":"Physical Medicine","RA":"Radiology","SU":"General, Plastic Surgery","TX":"Clinical Toxicology"}},"type":"string"},"medical_specialty_description":{"description":"Same as above but with the codes replaced with a human readable description. Note that & and and have been removed from the descriptions as they conflicted with the API syntax).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"openfda":{"properties":{"fei_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"k_number":{"items":{"description":"FDA-assigned premarket notification number, including leading letters. Leading letters “BK” indicates 510(k) clearance, or Premarket Notification, cleared by Center for Biologics Evaluation and Research. Leading letters “DEN” indicates De Novo, or Evaluation of Automatic Class III Designation. Leading letter “K” indicates 510(k) clearance, or Premarket Notification. `Source`: 510(k)","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"registration_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"pma_number":{"description":"FDA-assigned premarket application number, including leading letters. Leading letter “D” indicates Product Development Protocol type of Premarket Approval. Leading letters “BP” indicates Premarket Approval by Center for Biologics Evaluation and Research. Leading letter “H” indicates Humanitarian Device Exemption approval. Leading letter “N” indicates New Drug Application. Early PMAs were approved as NDAs. Leading letter “P” indicates Premarket Approval.","format":null,"is_exact":false,"possible_values":null,"type":"string"}},"type":"object"},"product_code":{"description":"A three-letter identifier assigned to a device category. Assignment is based upon the medical device classification designated under 21 CFR Parts 862-892, and the technology and intended use of the device. Occasionally these codes are changed over time.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"regulation_number":{"description":"The classification regulation in the Code of Federal Regulations (CFR) under which the device is identified, described, and formally classified (Code of Federal regulations Title 21, 862.00 through 892.00). The classification regulation covers various aspects of design, clinical evaluation, manufacturing, packaging, labeling, and postmarket surveillance of the specific medical device.","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"CFR database","link":"http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm"}},"type":"string"},"review_code":{"description":"Documentation forthcoming.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"review_panel":{"description":"Known as the “510(k) Review Panel” since 2014, this helps define the review division within CDRH in which the 510(k) would be reviewed, if it were reviewed today; this is derived from the procode and is always the same as the “Review Advisory Committee” field in the 510(k) database.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"summary_malfunction_reporting":{"description":"The Voluntary Malfunction Summary Reporting Program allows participating companies to submit certain medical device malfunction reports in summary form on a quarterly basis.  The program applies to eligible devices regulated by the Center for Devices and Radiological Health (CDRH) and Center for Biologics Evaluation and Research (CBER), including device-led combination products.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Eligible":"Device is eligible for The Voluntary Malfunction Summary Reporting Program","Ineligible":"Device is not eligible for The Voluntary Malfunction Summary Reporting Program"}},"type":"string"},"submission_type_id":{"description":"The submission type (510(k), PMA, 510(k) Exempt) to which a product code is limited, or “Contact ODE” if its limitations (if any) are undetermined.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"510(K)","2":"PMA","3":"Contact ODE","4":"510(K) Exempt"}},"type":"string"},"third_party_flag":{"description":"Eligibility for a manufacturer to utilize a contracted Accredited Person in lieu of direct submission to FDA. By law, FDA must in turn issue a final determination within 30 days after receiving the recommendation of an Accredited Person (yielding a streamlined review process).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"Y":"Device is a candidate for a third party review program","N":"Device is not a candidate for a third party review program"}},"type":"string"},"unclassified_reason":{"description":"This indicates the reason why a device is unclassified (e.g. Pre-Amendment).","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"Pre-Amendment","2":"IDE","3":"For Export Only","4":"Unknown","5":"Guidance Under Development","6":"Enforcement Discretion","7":"Not FDA Regulated"}},"type":"string"}},"type":"object"}',
      );
    },
    67419: function (e, t, i) {
      var a;
      ((a = function (e, t, i) {
        return (function (e) {
          var t = {};
          function i(a) {
            if (t[a]) return t[a].exports;
            var n = (t[a] = { i: a, l: !1, exports: {} });
            return (
              e[a].call(n.exports, n, n.exports, i),
              (n.l = !0),
              n.exports
            );
          }
          return (
            (i.m = e),
            (i.c = t),
            (i.i = function (e) {
              return e;
            }),
            (i.d = function (e, t, a) {
              i.o(e, t) ||
                Object.defineProperty(e, t, {
                  configurable: !1,
                  enumerable: !0,
                  get: a,
                });
            }),
            (i.n = function (e) {
              var t =
                e && e.__esModule
                  ? function () {
                      return e.default;
                    }
                  : function () {
                      return e;
                    };
              return (i.d(t, "a", t), t);
            }),
            (i.o = function (e, t) {
              return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (i.p = ""),
            i((i.s = 15))
          );
        })([
          function (e, t, i) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var a = (t.Browser = {});
            ("undefined" != typeof window &&
              ((a.SUPPORTED = "requestAnimationFrame" in window),
              (a.SUPPORTS_TOUCH = "ontouchstart" in window),
              (a.touch = !1),
              (a.dynamicInputDetection = !0),
              (a.iOS = function () {
                return (
                  /iPhone|iPad|iPod/.test(navigator.userAgent) &&
                  !window.MSStream
                );
              })),
              (t.Store = []),
              (t.Selectors = {
                POPPER: ".tippy-popper",
                TOOLTIP: ".tippy-tooltip",
                CONTENT: ".tippy-tooltip-content",
                CIRCLE: "[x-circle]",
                ARROW: "[x-arrow]",
                TOOLTIPPED_EL: "[data-tooltipped]",
                CONTROLLER: "[data-tippy-controller]",
              }));
            var n = (t.Defaults = {
              html: !1,
              position: "top",
              animation: "shift",
              animateFill: !0,
              arrow: !1,
              arrowSize: "regular",
              delay: 0,
              trigger: "mouseenter focus",
              duration: 350,
              interactive: !1,
              interactiveBorder: 2,
              theme: "dark",
              size: "regular",
              distance: 10,
              offset: 0,
              hideOnClick: !0,
              multiple: !1,
              followCursor: !1,
              inertia: !1,
              flipDuration: 350,
              sticky: !1,
              stickyDuration: 200,
              appendTo: function () {
                return document.body;
              },
              zIndex: 9999,
              touchHold: !1,
              performance: !1,
              dynamicTitle: !1,
              useContext: !1,
              reactInstance: void 0,
              popperOptions: {},
              open: void 0,
              onRequestClose: function () {},
            });
            t.DefaultsKeys = a.SUPPORTED && Object.keys(n);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                for (
                  var t = [!1, "webkit"],
                    i = e.charAt(0).toUpperCase() + e.slice(1),
                    a = 0;
                  a < t.length;
                  a++
                ) {
                  var n = t[a],
                    r = n ? "" + n + i : e;
                  if (void 0 !== window.document.body.style[r]) return r;
                }
                return null;
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                return Array.prototype.find ? e.find(t) : e.filter(t)[0];
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return e.replace(/-.+/, "");
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                return (
                  Element.prototype.closest ||
                  function (e) {
                    for (var t = this; t;) {
                      if (a.matches.call(t, e)) return t;
                      t = t.parentElement;
                    }
                  }
                ).call(e, t);
              }));
            var a = i(8);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                window.requestAnimationFrame(function () {
                  setTimeout(e, 0);
                });
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return {
                  tooltip: e.querySelector(a.Selectors.TOOLTIP),
                  circle: e.querySelector(a.Selectors.CIRCLE),
                  content: e.querySelector(a.Selectors.CONTENT),
                };
              }));
            var a = i(0);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return "visible" === e.style.visibility;
              }));
          },
          function (e, t, i) {
            "use strict";
            function a(e) {
              for (
                var t = (this.document || this.ownerDocument).querySelectorAll(
                    e,
                  ),
                  i = t.length;
                --i >= 0 && t.item(i) !== this;
              );
              return i > -1;
            }
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.matches =
                "undefined" == typeof window
                  ? a
                  : Element.prototype.matches ||
                    Element.prototype.matchesSelector ||
                    Element.prototype.webkitMatchesSelector ||
                    Element.prototype.mozMatchesSelector ||
                    Element.prototype.msMatchesSelector ||
                    a));
          },
          function (e, t, i) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var a =
                Object.assign ||
                function (e) {
                  for (var t = 1; t < arguments.length; t++) {
                    var i = arguments[t];
                    for (var a in i)
                      Object.prototype.hasOwnProperty.call(i, a) &&
                        (e[a] = i[a]);
                  }
                  return e;
                },
              n = (function () {
                function e(e, t) {
                  for (var i = 0; i < t.length; i++) {
                    var a = t[i];
                    ((a.enumerable = a.enumerable || !1),
                      (a.configurable = !0),
                      "value" in a && (a.writable = !0),
                      Object.defineProperty(e, a.key, a));
                  }
                }
                return function (t, i, a) {
                  return (i && e(t.prototype, i), a && e(t, a), t);
                };
              })(),
              r = i(13),
              s = c(r),
              o = c(i(30)),
              l = i(0);
            function c(e) {
              return e && e.__esModule ? e : { default: e };
            }
            var u = function (e) {
                return e.stopPropagation();
              },
              d = {
                html: null,
                position: "top",
                animation: "shift",
                animateFill: !0,
                arrow: !1,
                delay: 0,
                hideDelay: 0,
                trigger: "mouseenter focus",
                duration: 375,
                hideDuration: 375,
                interactive: !1,
                interactiveBorder: 2,
                theme: "dark",
                offset: 0,
                hideOnClick: !0,
                multiple: !1,
                followCursor: !1,
                inertia: !1,
                popperOptions: {},
                onShow: function () {},
                onShown: function () {},
                onHide: function () {},
                onHidden: function () {},
                disabled: !1,
                arrowSize: "regular",
                size: "regular",
                className: "",
                style: {},
                distance: 10,
                onRequestClose: function () {},
                sticky: !1,
                stickyDuration: 200,
                tag: "div",
                touchHold: !1,
                unmountHTMLWhenHide: !1,
                zIndex: 9999,
              },
              p = Object.keys(d),
              f = (function (e) {
                function t(e) {
                  !(function (e, t) {
                    if (!(e instanceof t))
                      throw new TypeError("Cannot call a class as a function");
                  })(this, t);
                  var i = (function (e, t) {
                    if (!e)
                      throw new ReferenceError(
                        "this hasn't been initialised - super() hasn't been called",
                      );
                    return !t ||
                      ("object" != typeof t && "function" != typeof t)
                      ? e
                      : t;
                  })(
                    this,
                    (t.__proto__ || Object.getPrototypeOf(t)).call(this, e),
                  );
                  return (
                    (i.initTippy = i._initTippy.bind(i)),
                    (i.destroyTippy = i._destroyTippy.bind(i)),
                    (i.updateTippy = i._updateTippy.bind(i)),
                    (i.updateReactDom = i._updateReactDom.bind(i)),
                    (i.showTooltip = i._showTooltip.bind(i)),
                    (i.hideTooltip = i._hideTooltip.bind(i)),
                    (i.updateSettings = i._updateSettings.bind(i)),
                    (i.state = { reactDOMValue: null }),
                    i
                  );
                }
                return (
                  (function (e, t) {
                    if ("function" != typeof t && null !== t)
                      throw new TypeError(
                        "Super expression must either be null or a function, not " +
                          typeof t,
                      );
                    ((e.prototype = Object.create(t && t.prototype, {
                      constructor: {
                        value: e,
                        enumerable: !1,
                        writable: !0,
                        configurable: !0,
                      },
                    })),
                      t &&
                        (Object.setPrototypeOf
                          ? Object.setPrototypeOf(e, t)
                          : (e.__proto__ = t)));
                  })(t, e),
                  n(t, [
                    {
                      key: "componentDidMount",
                      value: function () {
                        "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.initTippy();
                      },
                    },
                    {
                      key: "componentWillUnmount",
                      value: function () {
                        "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.destroyTippy();
                      },
                    },
                    {
                      key: "componentDidUpdate",
                      value: function (e) {
                        var t = this;
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document
                        ) {
                          if (!1 === this.props.disabled && !0 === e.disabled)
                            return (
                              this.updateSettings("disabled", !1),
                              this.destroyTippy(),
                              void this.initTippy()
                            );
                          if (!0 === this.props.disabled && !1 === e.disabled)
                            return (
                              this.updateSettings("disabled", !0),
                              void this.destroyTippy()
                            );
                          (!0 !== this.props.open ||
                            e.open ||
                            (this.updateSettings("open", !0),
                            setTimeout(function () {
                              t.showTooltip();
                            }, 0)),
                            !1 === this.props.open &&
                              !0 === e.open &&
                              (this.updateSettings("open", !1),
                              this.hideTooltip()),
                            this.props.html !== e.html && this.updateReactDom(),
                            this.props.title !== e.title && this.updateTippy());
                          var i = (function (e, t) {
                            var i = [];
                            return (
                              p.forEach(function (a) {
                                e[a] !== t[a] && i.push(a);
                              }),
                              i
                            );
                          })(this.props, e);
                          i.forEach(function (e) {
                            t.updateSettings(e, t.props[e]);
                          });
                        }
                      },
                    },
                    {
                      key: "_showTooltip",
                      value: function () {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          var e = this.tippy.getPopperElement(this.tooltipDOM);
                          this.tippy.show(e, this.props.duration);
                        }
                      },
                    },
                    {
                      key: "_hideTooltip",
                      value: function () {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          var e = this.tippy.getPopperElement(this.tooltipDOM);
                          this.tippy.hide(e, this.props.hideDuration);
                        }
                      },
                    },
                    {
                      key: "_updateSettings",
                      value: function (e, t) {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          var i = this.tippy.getPopperElement(this.tooltipDOM);
                          this.tippy.updateSettings(i, e, t);
                        }
                      },
                    },
                    {
                      key: "_updateReactDom",
                      value: function () {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          this.updateSettings("reactDOM", this.props.html);
                          var e = this.tippy.getPopperElement(this.tooltipDOM);
                          ("visible" === e.style.visibility ||
                            this.props.open) &&
                            this.tippy.updateForReact(e, this.props.html);
                        }
                      },
                    },
                    {
                      key: "_updateTippy",
                      value: function () {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          var e = this.tippy.getPopperElement(this.tooltipDOM);
                          this.tippy.update(e);
                        }
                      },
                    },
                    {
                      key: "_initTippy",
                      value: function () {
                        var e = this;
                        "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          l.Browser.SUPPORTED &&
                          (this.props.disabled
                            ? (this.tippy = null)
                            : (this.props.title &&
                                this.tooltipDOM.setAttribute(
                                  "title",
                                  this.props.title,
                                ),
                              (this.tippy = (0, o.default)(this.tooltipDOM, {
                                disabled: this.props.disabled,
                                position: this.props.position,
                                animation: this.props.animation,
                                animateFill: this.props.animateFill,
                                arrow: this.props.arrow,
                                arrowSize: this.props.arrowSize,
                                delay: this.props.delay,
                                hideDelay: this.props.hideDelay,
                                trigger: this.props.trigger,
                                duration: this.props.duration,
                                hideDuration: this.props.hideDuration,
                                interactive: this.props.interactive,
                                interactiveBorder: this.props.interactiveBorder,
                                theme: this.props.theme,
                                offset: this.props.offset,
                                hideOnClick: this.props.hideOnClick,
                                multiple: this.props.multiple,
                                size: this.props.size,
                                followCursor: this.props.followCursor,
                                inertia: this.props.inertia,
                                popperOptions: this.props.popperOptions,
                                onShow: this.props.onShow,
                                onShown: this.props.onShown,
                                onHide: this.props.onHide,
                                onHidden: this.props.onHidden,
                                distance: this.props.distance,
                                reactDOM: this.props.html,
                                setReactDOMValue: function (t) {
                                  return e.setState({ reactDOMValue: t });
                                },
                                unmountHTMLWhenHide:
                                  this.props.unmountHTMLWhenHide,
                                open: this.props.open,
                                sticky: this.props.sticky,
                                stickyDuration: this.props.stickyDuration,
                                tag: this.props.tag,
                                touchHold: this.props.touchHold,
                                onRequestClose: this.props.onRequestClose,
                                useContext: this.props.useContext,
                                reactInstance: this.props.useContext
                                  ? this
                                  : void 0,
                                performance: !0,
                                html: this.props.rawTemplate
                                  ? this.props.rawTemplate
                                  : void 0,
                                zIndex: this.props.zIndex,
                              })),
                              this.props.open && this.showTooltip()));
                      },
                    },
                    {
                      key: "_destroyTippy",
                      value: function () {
                        if (
                          "undefined" != typeof window &&
                          "undefined" != typeof document &&
                          this.tippy
                        ) {
                          var e = this.tippy.getPopperElement(this.tooltipDOM);
                          (this.updateSettings("open", !1),
                            this.tippy.hide(e, 0),
                            this.tippy.destroy(e),
                            (this.tippy = null));
                        }
                      },
                    },
                    {
                      key: "render",
                      value: function () {
                        var e = this,
                          t = this.props.tag;
                        return s.default.createElement(
                          s.default.Fragment,
                          null,
                          s.default.createElement(
                            t,
                            {
                              ref: function (t) {
                                e.tooltipDOM = t;
                              },
                              title: this.props.title,
                              className: this.props.className,
                              tabIndex: this.props.tabIndex,
                              style: a({ display: "inline" }, this.props.style),
                            },
                            this.props.children,
                          ),
                          this.state.reactDOMValue &&
                            s.default.createElement(
                              "div",
                              {
                                onClick: u,
                                onContextMenu: u,
                                onDoubleClick: u,
                                onDrag: u,
                                onDragEnd: u,
                                onDragEnter: u,
                                onDragExit: u,
                                onDragLeave: u,
                                onDragOver: u,
                                onDragStart: u,
                                onDrop: u,
                                onMouseDown: u,
                                onMouseEnter: u,
                                onMouseLeave: u,
                                onMouseMove: u,
                                onMouseOver: u,
                                onMouseOut: u,
                                onMouseUp: u,
                                onKeyDown: u,
                                onKeyPress: u,
                                onKeyUp: u,
                                onFocus: u,
                                onBlur: u,
                                onChange: u,
                                onInput: u,
                                onInvalid: u,
                                onSubmit: u,
                              },
                              this.state.reactDOMValue,
                            ),
                        );
                      },
                    },
                  ]),
                  t
                );
              })(r.Component);
            ((f.defaultProps = d), (t.default = f));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = this,
                  i = (0, r.default)(a.Store, function (e) {
                    return e.el === t;
                  });
                if (i) {
                  var o = i.popper,
                    l = i.settings.offset,
                    c = (0, n.default)(o.getAttribute("x-placement")),
                    u = Math.round(o.offsetWidth / 2),
                    d = Math.round(o.offsetHeight / 2),
                    p =
                      document.documentElement.offsetWidth ||
                      document.body.offsetWidth,
                    f = e.pageX,
                    m = e.pageY,
                    h = void 0,
                    g = void 0;
                  switch (c) {
                    case "top":
                      ((h = f - u + l), (g = m - 2.25 * d));
                      break;
                    case "left":
                      ((h = f - 2 * u - 10), (g = m - d + l));
                      break;
                    case "right":
                      ((h = f + d), (g = m - d + l));
                      break;
                    case "bottom":
                      ((h = f - u + l), (g = m + d / 1.5));
                  }
                  var y = f + 5 + u + l > p,
                    _ = f - 5 - u + l < 0;
                  (("top" !== c && "bottom" !== c) ||
                    (y && (h = p - 5 - 2 * u), _ && (h = 5)),
                    (o.style[(0, s.default)("transform")] =
                      "translate3d(" + h + "px, " + g + "px, 0)"));
                }
              }));
            var a = i(0),
              n = o(i(3)),
              r = o(i(2)),
              s = o(i(1));
            function o(e) {
              return e && e.__esModule ? e : { default: e };
            }
            o(i(4));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return -(e - a.Defaults.distance) + "px";
              }));
            var a = i(0);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = e.getAttribute("title");
                (t && e.setAttribute("data-original-title", t),
                  e.removeAttribute("title"));
              }));
          },
          function (t, i) {
            t.exports = e;
          },
          function (e, t, i) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var a = r(i(13)),
              n = r(i(9));
            function r(e) {
              return e && e.__esModule ? e : { default: e };
            }
            t.default = function (e) {
              var t =
                arguments.length > 1 && void 0 !== arguments[1]
                  ? arguments[1]
                  : {};
              return function (i) {
                var r = (function (e, t) {
                  var i = {};
                  for (var a in e)
                    t.indexOf(a) >= 0 ||
                      (Object.prototype.hasOwnProperty.call(e, a) &&
                        (i[a] = e[a]));
                  return i;
                })(i, []);
                return a.default.createElement(
                  n.default,
                  t,
                  a.default.createElement(e, r),
                );
              };
            };
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.withTooltip = t.Tooltip = void 0));
            var a = r(i(9)),
              n = r(i(14));
            function r(e) {
              return e && e.__esModule ? e : { default: e };
            }
            ((t.Tooltip = a.default), (t.withTooltip = n.default));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function () {
                var e,
                  t = function () {
                    ((a.Browser.touch = !0),
                      a.Browser.iOS() &&
                        document.body.classList.add("tippy-touch"),
                      a.Browser.dynamicInputDetection &&
                        window.performance &&
                        document.addEventListener("mousemove", i));
                  },
                  i =
                    ((e = void 0),
                    function () {
                      var t = performance.now();
                      (t - e < 20 &&
                        ((a.Browser.touch = !1),
                        document.removeEventListener("mousemove", i),
                        a.Browser.iOS() ||
                          document.body.classList.remove("tippy-touch")),
                        (e = t));
                    });
                (document.addEventListener("click", function (e) {
                  if (!(e.target instanceof Element)) return (0, n.default)();
                  var t = (0, r.default)(e.target, a.Selectors.TOOLTIPPED_EL),
                    i = (0, r.default)(e.target, a.Selectors.POPPER);
                  if (i) {
                    var o = (0, s.default)(a.Store, function (e) {
                      return e.popper === i;
                    });
                    if (!o) return;
                    if (o.settings.interactive) return;
                  }
                  if (t) {
                    var l = (0, s.default)(a.Store, function (e) {
                      return e.el === t;
                    });
                    if (!l) return;
                    var c = l.settings,
                      u = c.hideOnClick,
                      d = c.multiple,
                      p = c.trigger;
                    if (
                      (!d && a.Browser.touch) ||
                      (!d && -1 !== p.indexOf("click"))
                    )
                      return (0, n.default)(l);
                    if (!0 !== u || -1 !== p.indexOf("click")) return;
                  }
                  !(0, r.default)(e.target, a.Selectors.CONTROLLER) &&
                    document.querySelector(a.Selectors.POPPER) &&
                    (0, n.default)();
                }),
                  document.addEventListener("touchstart", t),
                  window.addEventListener("blur", function (e) {
                    var t = document.activeElement;
                    t &&
                      t.blur &&
                      o.matches.call(t, a.Selectors.TOOLTIPPED_EL) &&
                      t.blur();
                  }),
                  !a.Browser.SUPPORTS_TOUCH &&
                    (navigator.maxTouchPoints > 0 ||
                      navigator.msMaxTouchPoints > 0) &&
                    document.addEventListener("pointerdown", t));
              }));
            var a = i(0),
              n = l(i(25)),
              r = l(i(4)),
              s = l(i(2)),
              o = i(8);
            function l(e) {
              return e && e.__esModule ? e : { default: e };
            }
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t, i) {
                var r = i.position,
                  s = i.distance,
                  o = i.arrow,
                  l = i.animateFill,
                  c = i.inertia,
                  u = i.animation,
                  d = i.arrowSize,
                  p = i.size,
                  f = i.theme,
                  m = i.html,
                  h = i.zIndex,
                  g = i.interactive,
                  y = document.createElement("div");
                (y.setAttribute("class", "tippy-popper"),
                  y.setAttribute("role", "tooltip"),
                  y.setAttribute("aria-hidden", "true"),
                  y.setAttribute("id", "tippy-tooltip-" + e),
                  (y.style.zIndex = h));
                var _ = document.createElement("div");
                if (
                  (_.setAttribute(
                    "class",
                    "tippy-tooltip tippy-tooltip--" + p + " leave",
                  ),
                  _.setAttribute("data-animation", u),
                  f.split(" ").forEach(function (e) {
                    _.classList.add(e + "-theme");
                  }),
                  o)
                ) {
                  var b = document.createElement("div");
                  (b.setAttribute("class", "arrow-" + d),
                    b.setAttribute("x-arrow", ""),
                    _.appendChild(b));
                }
                if (l) {
                  _.setAttribute("data-animatefill", "");
                  var v = document.createElement("div");
                  (v.setAttribute("class", "leave"),
                    v.setAttribute("x-circle", ""),
                    _.appendChild(v));
                }
                (c && _.setAttribute("data-inertia", ""),
                  g && _.setAttribute("data-interactive", ""));
                var w = document.createElement("div");
                if ((w.setAttribute("class", "tippy-tooltip-content"), m)) {
                  var A = void 0;
                  (m instanceof Element
                    ? (w.appendChild(m), (A = "#" + m.id || 0))
                    : ((w.innerHTML = document.getElementById(
                        m.replace("#", ""),
                      ).innerHTML),
                      (A = m)),
                    y.classList.add("html-template"),
                    g && y.setAttribute("tabindex", "-1"),
                    _.setAttribute("data-template-id", A));
                } else w.innerHTML = t;
                return (
                  (_.style[(0, a.default)(r)] = (0, n.default)(s)),
                  _.appendChild(w),
                  y.appendChild(_),
                  y
                );
              }));
            var a = r(i(3)),
              n = r(i(11));
            function r(e) {
              return e && e.__esModule ? e : { default: e };
            }
          },
          function (e, t, i) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var a =
              Object.assign ||
              function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var i = arguments[t];
                  for (var a in i)
                    Object.prototype.hasOwnProperty.call(i, a) && (e[a] = i[a]);
                }
                return e;
              };
            t.default = function (e) {
              var t = e.el,
                i = e.popper,
                u = e.settings,
                d = u.position,
                p = u.popperOptions,
                f = u.offset,
                m = u.distance,
                h = u.flipDuration,
                g = (0, l.default)(i).tooltip,
                y = a({ placement: d }, p || {}, {
                  modifiers: a({}, p ? p.modifiers : {}, {
                    flip: a(
                      { padding: m + 5 },
                      p && p.modifiers ? p.modifiers.flip : {},
                    ),
                    offset: a(
                      { offset: f },
                      p && p.modifiers ? p.modifiers.offset : {},
                    ),
                  }),
                  onUpdate: function () {
                    var e = g.style;
                    ((e.top = ""),
                      (e.bottom = ""),
                      (e.left = ""),
                      (e.right = ""),
                      (e[(0, o.default)(i.getAttribute("x-placement"))] = (0,
                      c.default)(m)));
                  },
                });
              if (window.MutationObserver) {
                var _ = i.style,
                  b = new MutationObserver(function () {
                    ((_[(0, s.default)("transitionDuration")] = "0ms"),
                      e.popperInstance.update(),
                      (0, r.default)(function () {
                        _[(0, s.default)("transitionDuration")] = h + "ms";
                      }));
                  });
                (b.observe(i, {
                  childList: !0,
                  subtree: !0,
                  characterData: !0,
                }),
                  (e._mutationObserver = b));
              }
              return new n.default(t, i, y);
            };
            var n = u(i(38)),
              r = u(i(5)),
              s = u(i(1)),
              o = u(i(3)),
              l = u(i(6)),
              c = u(i(11));
            function u(e) {
              return e && e.__esModule ? e : { default: e };
            }
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = this;
                return e.reduce(function (e, i) {
                  var c = u,
                    d = (0, o.default)(
                      t.settings.performance
                        ? t.settings
                        : (0, a.default)(i, t.settings),
                    ),
                    p = d.html,
                    f = d.reactDOM,
                    m = d.trigger,
                    h = d.touchHold,
                    g = i.getAttribute("title");
                  if (!g && !p && !f) return e;
                  (i.setAttribute("data-tooltipped", ""),
                    i.setAttribute("aria-describedby", "tippy-tooltip-" + c),
                    (0, l.default)(i));
                  var y = (0, n.default)(c, g, d),
                    _ = s.default.call(t, i, y, d),
                    b = [];
                  return (
                    m
                      .trim()
                      .split(" ")
                      .forEach(function (e) {
                        return (b = b.concat((0, r.default)(e, i, _, h)));
                      }),
                    e.push({
                      id: c,
                      el: i,
                      popper: y,
                      settings: d,
                      listeners: b,
                      tippyInstance: t,
                    }),
                    u++,
                    e
                  );
                }, []);
              }));
            var a = c(i(24)),
              n = c(i(17)),
              r = c(i(20)),
              s = c(i(23)),
              o = c(i(21)),
              l = c(i(12));
            function c(e) {
              return e && e.__esModule ? e : { default: e };
            }
            i(0);
            var u = 1;
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t, i, n) {
                var r = [];
                return (
                  "manual" === e ||
                    (t.addEventListener(e, i.handleTrigger),
                    r.push({ event: e, handler: i.handleTrigger }),
                    "mouseenter" === e &&
                      (a.Browser.SUPPORTS_TOUCH &&
                        n &&
                        (t.addEventListener("touchstart", i.handleTrigger),
                        r.push({
                          event: "touchstart",
                          handler: i.handleTrigger,
                        }),
                        t.addEventListener("touchend", i.handleMouseleave),
                        r.push({
                          event: "touchend",
                          handler: i.handleMouseleave,
                        })),
                      t.addEventListener("mouseleave", i.handleMouseleave),
                      r.push({
                        event: "mouseleave",
                        handler: i.handleMouseleave,
                      })),
                    "focus" === e &&
                      (t.addEventListener("blur", i.handleBlur),
                      r.push({ event: "blur", handler: i.handleBlur }))),
                  r
                );
              }));
            var a = i(0);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return (
                  e.arrow && (e.animateFill = !1),
                  e.appendTo &&
                    "function" == typeof e.appendTo &&
                    (e.appendTo = e.appendTo()),
                  e
                );
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                return e instanceof Element
                  ? [e]
                  : Array.isArray(e)
                    ? e
                    : [].slice.call(document.querySelectorAll(e));
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t, i) {
                var o = this,
                  l = (i.position, i.delay),
                  c = (i.duration, i.interactive),
                  u = (i.interactiveBorder, i.distance, i.hideOnClick),
                  d = i.trigger,
                  p = i.touchHold,
                  f = void i.touchWait,
                  m = void 0,
                  h = function () {
                    (clearTimeout(f), clearTimeout(m));
                  },
                  g = function () {
                    if ((h(), !(0, n.default)(t))) {
                      var e = Array.isArray(l) ? l[0] : l;
                      l
                        ? (f = setTimeout(function () {
                            return o.show(t);
                          }, e))
                        : o.show(t);
                    }
                  },
                  y = function () {
                    h();
                    var e = Array.isArray(l) ? l[1] : l;
                    l
                      ? (m = setTimeout(function () {
                          return o.hide(t);
                        }, e))
                      : o.hide(t);
                  };
                return {
                  handleTrigger: function (i) {
                    var r =
                      "mouseenter" === i.type &&
                      a.Browser.SUPPORTS_TOUCH &&
                      a.Browser.touch;
                    if (!r || !p) {
                      var s = "click" === i.type,
                        l = "persistent" !== u;
                      (s && (0, n.default)(t) && l
                        ? y()
                        : (function (e) {
                            o.callbacks.wait
                              ? o.callbacks.wait.call(t, g, e)
                              : g();
                          })(i),
                        r && a.Browser.iOS() && e.click && e.click());
                    }
                  },
                  handleMouseleave: function (n) {
                    if (!(
                      "mouseleave" === n.type &&
                      a.Browser.SUPPORTS_TOUCH &&
                      a.Browser.touch &&
                      p
                    )) {
                      if (c)
                        return (
                          document.body.addEventListener("mouseleave", y),
                          void document.addEventListener(
                            "mousemove",
                            function n(o) {
                              var l = function () {
                                  (document.body.removeEventListener(
                                    "mouseleave",
                                    y,
                                  ),
                                    document.removeEventListener(
                                      "mousemove",
                                      n,
                                    ),
                                    y());
                                },
                                c = (0, r.default)(
                                  o.target,
                                  a.Selectors.TOOLTIPPED_EL,
                                ),
                                u =
                                  (0, r.default)(
                                    o.target,
                                    a.Selectors.POPPER,
                                  ) === t,
                                p = c === e,
                                f = -1 !== d.indexOf("click");
                              if (c && c !== e) return l();
                              u || p || f || ((0, s.default)(o, t, i) && l());
                            },
                          )
                        );
                      y();
                    }
                  },
                  handleBlur: function (e) {
                    e.relatedTarget &&
                      !a.Browser.touch &&
                      ((0, r.default)(e.relatedTarget, a.Selectors.POPPER) ||
                        y());
                  },
                };
              }));
            var a = i(0),
              n = o(i(7)),
              r = o(i(4)),
              s = o(i(32));
            function o(e) {
              return e && e.__esModule ? e : { default: e };
            }
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                var i = a.DefaultsKeys.reduce(function (i, a) {
                  var n = e.getAttribute("data-" + a.toLowerCase()) || t[a];
                  return (
                    "false" === n && (n = !1),
                    "true" === n && (n = !0),
                    isFinite(n) && !isNaN(parseFloat(n)) && (n = parseFloat(n)),
                    "string" == typeof n &&
                      "[" === n.trim().charAt(0) &&
                      (n = JSON.parse(n)),
                    (i[a] = n),
                    i
                  );
                }, {});
                return Object.assign({}, t, i);
              }));
            var a = i(0);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                a.Store.forEach(function (t) {
                  var i = t.popper,
                    a = t.tippyInstance,
                    n = t.settings,
                    r = n.appendTo,
                    s = n.hideOnClick,
                    o = n.trigger;
                  if (r.contains(i)) {
                    var l = !0 === s || -1 !== o.indexOf("focus"),
                      c = !e || i !== e.popper;
                    l && c && (t.settings.onRequestClose(), a.hide(i));
                  }
                });
              }));
            var a = i(0);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function e() {
                return !e.done && ((e.done = !0), (0, r.default)(), !0);
              }));
            var a,
              n = i(16),
              r = (a = n) && a.__esModule ? a : { default: a };
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = e.popper,
                  i = e.popperInstance,
                  s = e.settings.stickyDuration;
                (0, a.default)(function e() {
                  (i && i.scheduleUpdate(),
                    (t.style[(0, n.default)("transitionDuration")] = s + "ms"),
                    (0, r.default)(t)
                      ? window.requestAnimationFrame(e)
                      : (t.style[(0, n.default)("transitionDuration")] = ""));
                });
              }));
            var a = s(i(5)),
              n = s(i(1)),
              r = s(i(7));
            function s(e) {
              return e && e.__esModule ? e : { default: e };
            }
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = e.el,
                  i = e.popper,
                  s = e.settings,
                  o = s.appendTo,
                  l = s.followCursor;
                o.contains(i) ||
                  (o.appendChild(i),
                  e.popperInstance
                    ? (e.popperInstance.update(),
                      (l && !a.Browser.touch) ||
                        e.popperInstance.enableEventListeners())
                    : (e.popperInstance = (0, r.default)(e)),
                  l &&
                    !a.Browser.touch &&
                    (t.addEventListener("mousemove", n.default),
                    e.popperInstance.disableEventListeners()));
              }));
            var a = i(0),
              n = s(i(10)),
              r = s(i(18));
            function s(e) {
              return e && e.__esModule ? e : { default: e };
            }
            s(i(1));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t, i) {
                if (!t) return i();
                var a = (0, r.default)(e.popper).tooltip,
                  n = !1,
                  s = function (e) {
                    e.target !== a || n || ((n = !0), i());
                  };
                (a.addEventListener("webkitTransitionEnd", s),
                  a.addEventListener("transitionend", s),
                  clearTimeout(e._transitionendTimeout),
                  (e._transitionendTimeout = setTimeout(function () {
                    n || i();
                  }, t)));
              }),
              i(0));
            var a,
              n = i(6),
              r = (a = n) && a.__esModule ? a : { default: a };
          },
          function (e, t, i) {
            "use strict";
            Object.defineProperty(t, "__esModule", { value: !0 });
            var a =
                Object.assign ||
                function (e) {
                  for (var t = 1; t < arguments.length; t++) {
                    var i = arguments[t];
                    for (var a in i)
                      Object.prototype.hasOwnProperty.call(i, a) &&
                        (e[a] = i[a]);
                  }
                  return e;
                },
              n = (function () {
                function e(e, t) {
                  for (var i = 0; i < t.length; i++) {
                    var a = t[i];
                    ((a.enumerable = a.enumerable || !1),
                      (a.configurable = !0),
                      "value" in a && (a.writable = !0),
                      Object.defineProperty(e, a.key, a));
                  }
                }
                return function (t, i, a) {
                  return (i && e(t.prototype, i), a && e(t, a), t);
                };
              })(),
              r = i(0),
              s = D(i(39)),
              o = D(i(26)),
              l = D(i(5)),
              c = (D(i(1)), D(i(2))),
              u = D(i(34)),
              d = D(i(12)),
              p = D(i(33)),
              f = D(i(37)),
              m = D(i(35)),
              h = D(i(6)),
              g = D(i(31)),
              y = D(i(7)),
              _ = D(i(36)),
              b = D(i(10)),
              v = D(i(22)),
              w = D(i(29)),
              A = D(i(28)),
              x = D(i(27)),
              k = D(i(19));
            function D(e) {
              return e && e.__esModule ? e : { default: e };
            }
            var T = (function () {
              function e(t) {
                var i =
                  arguments.length > 1 && void 0 !== arguments[1]
                    ? arguments[1]
                    : {};
                (!(function (e, t) {
                  if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function");
                })(this, e),
                  r.Browser.SUPPORTED &&
                    ((0, o.default)(),
                    (this.state = { destroyed: !1 }),
                    (this.selector = t),
                    (this.settings = a({}, r.Defaults, i)),
                    (i.show || i.shown || i.hide || i.hidden) &&
                      console.warn(
                        "Callbacks without the `on` prefix are deprecated (with the exception of `wait`). Use onShow, onShown, onHide, and onHidden instead.",
                      ),
                    (this.callbacks = {
                      wait: i.wait,
                      show: i.onShow || i.show || _.default,
                      shown: i.onShown || i.shown || _.default,
                      hide: i.onHide || i.hide || _.default,
                      hidden: i.onHidden || i.hidden || _.default,
                    }),
                    (this.store = k.default.call(this, (0, v.default)(t))),
                    r.Store.push.apply(r.Store, this.store)));
              }
              return (
                n(e, [
                  {
                    key: "getPopperElement",
                    value: function (e) {
                      try {
                        return (0, c.default)(this.store, function (t) {
                          return t.el === e;
                        }).popper;
                      } catch (t) {
                        console.error(
                          "[getPopperElement]: Element passed as the argument does not exist in the instance",
                        );
                      }
                    },
                  },
                  {
                    key: "getReferenceElement",
                    value: function (e) {
                      try {
                        return (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        }).el;
                      } catch (t) {
                        console.error(
                          "[getReferenceElement]: Popper passed as the argument does not exist in the instance",
                        );
                      }
                    },
                  },
                  {
                    key: "getReferenceData",
                    value: function (e) {
                      return (0, c.default)(this.store, function (t) {
                        return t.el === e || t.popper === e;
                      });
                    },
                  },
                  {
                    key: "updateSettings",
                    value: function (e, t, i) {
                      var n = (0, c.default)(this.store, function (t) {
                        return t.popper === e;
                      });
                      if (n) {
                        var r = a(
                          {},
                          n.settings,
                          (function (e, t, i) {
                            return (
                              t in e
                                ? Object.defineProperty(e, t, {
                                    value: i,
                                    enumerable: !0,
                                    configurable: !0,
                                    writable: !0,
                                  })
                                : (e[t] = i),
                              e
                            );
                          })({}, t, i),
                        );
                        n.settings = r;
                      }
                    },
                  },
                  {
                    key: "updateForReact",
                    value: function (e, t) {
                      var i = e.querySelector(r.Selectors.CONTENT),
                        a = (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        });
                      if (a) {
                        var n = a.settings,
                          o = n.useContext,
                          l = n.setReactDOMValue;
                        o
                          ? l(s.default.createPortal(t, i))
                          : s.default.render(t, i);
                      }
                    },
                  },
                  {
                    key: "show",
                    value: function (e, t) {
                      var i = this;
                      if (!this.state.destroyed) {
                        var a = (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        });
                        if (a) {
                          var n = (0, h.default)(e),
                            s = n.tooltip,
                            o = n.circle,
                            u = n.content;
                          if (document.body.contains(a.el)) {
                            if (
                              (this.callbacks.show.call(e),
                              !a.settings || !1 !== a.settings.open)
                            ) {
                              a.settings.reactDOM &&
                                this.updateForReact(e, a.settings.reactDOM);
                              var p = a.el,
                                _ = a.settings,
                                b = (_.appendTo, _.sticky),
                                v = _.interactive,
                                k = _.followCursor,
                                D = _.flipDuration,
                                T = _.duration;
                              if (_.dynamicTitle) {
                                var C = p.getAttribute("title");
                                C && ((u.innerHTML = C), (0, d.default)(p));
                              }
                              var P =
                                void 0 !== t ? t : Array.isArray(T) ? T[0] : T;
                              ((0, g.default)([e, s, o], 0),
                                (0, A.default)(a),
                                (e.style.visibility = "visible"),
                                e.setAttribute("aria-hidden", "false"),
                                (0, l.default)(function () {
                                  ((k && !r.Browser.touch) ||
                                    (a.popperInstance.update(),
                                    (0, g.default)([e], D)),
                                    (0, g.default)([s, o], P),
                                    o && (u.style.opacity = 1),
                                    v && p.classList.add("active"),
                                    b && (0, x.default)(a),
                                    (0, f.default)(s, o),
                                    (0, m.default)([s, o], function (e) {
                                      (e.contains("tippy-notransition") &&
                                        e.remove("tippy-notransition"),
                                        e.remove("leave"),
                                        e.add("enter"));
                                    }),
                                    (0, w.default)(a, P, function () {
                                      (0, y.default)(e) &&
                                        !a._onShownFired &&
                                        (v && e.focus(),
                                        s.classList.add("tippy-notransition"),
                                        (a._onShownFired = !0),
                                        i.callbacks.shown.call(e));
                                    }));
                                }));
                            }
                          } else this.destroy(e);
                        }
                      }
                    },
                  },
                  {
                    key: "hide",
                    value: function (e, t) {
                      var i = this;
                      if (!this.state.destroyed) {
                        this.callbacks.hide.call(e);
                        var a = (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        });
                        if (a) {
                          var n = (0, h.default)(e),
                            r = n.tooltip,
                            o = n.circle,
                            l = n.content;
                          if (
                            !1 !== a.settings.disabled ||
                            !a ||
                            !a.settings.open
                          ) {
                            var u =
                                a &&
                                a.settings &&
                                a.settings.unmountHTMLWhenHide &&
                                a.settings.reactDOM,
                              d = a.el,
                              f = a.settings,
                              _ = f.appendTo,
                              v = (f.sticky, f.interactive),
                              A = (f.followCursor, f.html),
                              x = f.trigger,
                              k = f.duration,
                              D =
                                void 0 !== t ? t : Array.isArray(k) ? k[1] : k;
                            ((a._onShownFired = !1),
                              v && d.classList.remove("active"),
                              (e.style.visibility = "hidden"),
                              e.setAttribute("aria-hidden", "true"),
                              (0, g.default)([r, o, o ? l : null], D),
                              o && (l.style.opacity = 0),
                              (0, m.default)([r, o], function (e) {
                                (e.contains("tippy-tooltip") &&
                                  e.remove("tippy-notransition"),
                                  e.remove("enter"),
                                  e.add("leave"));
                              }),
                              A &&
                                -1 !== x.indexOf("click") &&
                                (0, p.default)(d) &&
                                d.focus(),
                              (0, w.default)(a, D, function () {
                                !(0, y.default)(e) &&
                                  _.contains(e) &&
                                  "1" !== getComputedStyle(r).opacity &&
                                  (d.removeEventListener(
                                    "mousemove",
                                    b.default,
                                  ),
                                  a.popperInstance.disableEventListeners(),
                                  _.removeChild(e),
                                  i.callbacks.hidden.call(e),
                                  u && s.default.unmountComponentAtNode(l));
                              }));
                          }
                        }
                      }
                    },
                  },
                  {
                    key: "update",
                    value: function (e) {
                      if (!this.state.destroyed) {
                        var t = (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        });
                        if (t) {
                          var i = (0, h.default)(e).content,
                            a = t.el,
                            n = t.settings.html;
                          n instanceof Element
                            ? console.warn(
                                "Aborted: update() should not be used if `html` is a DOM element",
                              )
                            : ((i.innerHTML = n
                                ? document.getElementById(n.replace("#", ""))
                                    .innerHTML
                                : a.getAttribute("title") ||
                                  a.getAttribute("data-original-title")),
                              n || (0, d.default)(a));
                        }
                      }
                    },
                  },
                  {
                    key: "destroy",
                    value: function (e, t) {
                      var i = this;
                      if (!this.state.destroyed) {
                        var a = (0, c.default)(this.store, function (t) {
                          return t.popper === e;
                        });
                        if (a) {
                          var n = a.el,
                            s = a.popperInstance,
                            o = a.listeners,
                            l = a._mutationObserver;
                          ((0, y.default)(e) && this.hide(e, 0),
                            o.forEach(function (e) {
                              return n.removeEventListener(e.event, e.handler);
                            }),
                            n.setAttribute(
                              "title",
                              n.getAttribute("data-original-title"),
                            ),
                            n.removeAttribute("data-original-title"),
                            n.removeAttribute("data-tooltipped"),
                            n.removeAttribute("aria-describedby"),
                            s && s.destroy(),
                            l && l.disconnect(),
                            r.Store.splice(
                              (0, u.default)(r.Store, function (t) {
                                return t.popper === e;
                              }),
                              1,
                            ),
                            (void 0 === t || t) &&
                              (this.store = r.Store.filter(function (e) {
                                return e.tippyInstance === i;
                              })));
                        }
                      }
                    },
                  },
                  {
                    key: "destroyAll",
                    value: function () {
                      var e = this;
                      if (!this.state.destroyed) {
                        var t = this.store.length;
                        (this.store.forEach(function (i, a) {
                          var n = i.popper;
                          e.destroy(n, a === t - 1);
                        }),
                          (this.store = null),
                          (this.state.destroyed = !0));
                      }
                    },
                  },
                ]),
                e
              );
            })();
            function C(e, t) {
              return new T(e, t);
            }
            ((C.Browser = r.Browser),
              (C.Defaults = r.Defaults),
              (C.disableDynamicInputDetection = function () {
                return (r.Browser.dynamicInputDetection = !1);
              }),
              (C.enableDynamicInputDetection = function () {
                return (r.Browser.dynamicInputDetection = !0);
              }),
              (t.default = C));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                e.forEach(function (e) {
                  if (e) {
                    var i = o.matches.call(e, n.Selectors.CONTENT)
                      ? Math.round(t / 1.3)
                      : t;
                    e.style[(0, s.default)("transitionDuration")] = i + "ms";
                  }
                });
              }));
            var a,
              n = i(0),
              r = i(1),
              s = (a = r) && a.__esModule ? a : { default: a },
              o = i(8);
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t, i) {
                if (!t.getAttribute("x-placement")) return !0;
                var a = e.clientX,
                  n = e.clientY,
                  s = i.interactiveBorder,
                  o = i.distance,
                  l = t.getBoundingClientRect(),
                  c = (0, r.default)(t.getAttribute("x-placement")),
                  u = s + o,
                  d = {
                    top: l.top - n > s,
                    bottom: n - l.bottom > s,
                    left: l.left - a > s,
                    right: a - l.right > s,
                  };
                switch (c) {
                  case "top":
                    d.top = l.top - n > u;
                    break;
                  case "bottom":
                    d.bottom = n - l.bottom > u;
                    break;
                  case "left":
                    d.left = l.left - a > u;
                    break;
                  case "right":
                    d.right = a - l.right > u;
                }
                return d.top || d.bottom || d.left || d.right;
              }));
            var a,
              n = i(3),
              r = (a = n) && a.__esModule ? a : { default: a };
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e) {
                var t = e.getBoundingClientRect();
                return (
                  t.top >= 0 &&
                  t.left >= 0 &&
                  t.bottom <=
                    (window.innerHeight ||
                      document.documentElement.clientHeight) &&
                  t.right <=
                    (window.innerWidth || document.documentElement.clientWidth)
                );
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                return Array.prototype.findIndex
                  ? e.findIndex(t)
                  : e.indexOf((0, r.default)(e, t));
              }));
            var a,
              n = i(2),
              r = (a = n) && a.__esModule ? a : { default: a };
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                e.forEach(function (e) {
                  e && t(e.classList);
                });
              }));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function () {}));
          },
          function (e, t, i) {
            "use strict";
            (Object.defineProperty(t, "__esModule", { value: !0 }),
              (t.default = function (e, t) {
                t
                  ? window.getComputedStyle(t)[(0, r.default)("transform")]
                  : window.getComputedStyle(e).opacity;
              }));
            var a,
              n = i(1),
              r = (a = n) && a.__esModule ? a : { default: a };
          },
          function (e, i) {
            e.exports = t;
          },
          function (e, t) {
            e.exports = i;
          },
        ]);
      }),
        (e.exports = a(i(96540), i(28794), i(40961))));
    },
    70783: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"product_id":{"description":"ProductID is a concatenation of the NDC product code and SPL documentID.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_ndc":{"description":"The labeler manufacturer code and product code segments of the NDC number, separated by a hyphen.","format":null,"pattern":"^[0-9]{5,4}-[0-9]{4,3}$","is_exact":false,"possible_values":null,"type":"string"},"spl_id":{"pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for a particular version of a Structured Product Label for a product. Also referred to as the document ID.","is_exact":false,"possible_values":null,"type":"string"},"product_type":{"description":"Type of drug product","format":null,"is_exact":true,"possible_values":null,"type":"string"},"finished":{"description":"Details whether the product is finished or not. FDA does not review and approve unfinished products. Therefore, all products in this file are considered unapproved.","format":null,"is_exact":false,"type":"string"},"brand_name":{"description":"Brand or trade name of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"brand_name_base":{"description":"The base of the brand name excluding its suffix.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"brand_name_suffix":{"description":"A suffix to the proprietary name, a value here should be appended to the ProprietaryName field to obtain the complete name of the product. This suffix is often used to distinguish characteristics of a product such as extended release (“XR”) or sleep aid (“PM”).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"generic_name":{"description":"Generic name(s) of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"dosage_form":{"description":"The drug’s dosage form. There is no standard, but values may include terms like `tablet` or `solution for injection`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"route":{"description":"The route of administation of the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"marketing_start_date":{"description":"This is the date that the labeler indicates was the start of its marketing of the drug product.","format":"date","is_exact":false,"possible_values":null,"type":"type"},"marketing_end_date":{"description":"This is the date the product will no longer be available on the market.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"marketing_category":{"description":"Product types are broken down into several potential Marketing Categories, such as NDA/ANDA/BLA, OTC Monograph, or Unapproved Drug.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"application_number":{"pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"pharm_class":{"description":"These are the reported pharmacological class categories corresponding to the SubstanceNames listed above.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"dea_schedule":{"description":"This is the assigned DEA Schedule number as reported by the labeler. Values are CI, CII, CIII, CIV, and CV.","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"CI","2":"CII","3":"CIII","4":"CIV","5":"CV"}},"type":"string"},"listing_expiration_date":{"description":"This is the date when the listing record will expire if not updated or certified by the firm.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"active_ingredients":{"type":"object","properties":{"name":{"description":"The names of the active, medicinal ingredients in the drug product.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"strength":{"description":"The strength of the active, medicinal ingredients in the drug product.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"packaging":{"type":"object","properties":{"package_ndc":{"pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"description":{"description":"A description of the size and type of packaging in sentence form. Multilevel packages will have the descriptions concatenated together.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"marketing_start_date":{"description":"This is the date that the labeler indicates was the start of its marketing of the drug product.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"marketing_end_date":{"description":"This is the date the product will no longer be available on the market.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"sample":{"description":"Indicates whether this is a sample packaging or not.","format":null,"is_exact":false,"possible_values":null,"type":"string"}}},"openfda":{"type":"object","properties":{"is_original_packager":{"description":"Whether or not the drug has been repackaged for distribution.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"manufacturer_name":{"description":"Name of manufacturer or company that makes this drug product, corresponding to the labeler code segment of the NDC.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"nui":{"description":"Unique identifier applied to a drug concept within the National Drug File Reference Terminology (NDF-RT).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"pharm_class_cs":{"description":"Chemical structure classification of the drug product’s pharmacologic class. Takes the form of the classification, followed by `[Chemical/Ingredient]` (such as `Thiazides [Chemical/Ingredient]` or `Antibodies, Monoclonal [Chemical/Ingredient].","format":null,"is_exact":true,"possible_values":null,"type":"string"},"pharm_class_epc":{"description":"Established pharmacologic class associated with an approved indication of an active moiety (generic drug) that the FDA has determined to be scientifically valid and clinically meaningful. Takes the form of the pharmacologic class, followed by `[EPC]` (such as `Thiazide Diuretic [EPC]` or `Tumor Necrosis Factor Blocker [EPC]`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"pharm_class_moa":{"description":"Mechanism of action of the drug—molecular, subcellular, or cellular functional activity—of the drug’s established pharmacologic class. Takes the form of the mechanism of action, followed by `[MoA]` (such as `Calcium Channel Antagonists [MoA]` or `Tumor Necrosis Factor Receptor Blocking Activity [MoA]`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"pharm_class_pe":{"description":"Physiologic effect or pharmacodynamic effect—tissue, organ, or organ system level functional activity—of the drug’s established pharmacologic class. Takes the form of the effect, followed by `[PE]` (such as `Increased Diuresis [PE]` or `Decreased Cytokine Activity [PE]`.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"rxcui":{"pattern":"^[0-9]{6}$","description":"The RxNorm Concept Unique Identifier. RxCUI is a unique number that describes a semantic concept about the drug product, including its ingredients, strength, and dose forms.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"spl_set_id":{"pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for the Structured Product Label for a product, which is stable across versions of the label. Also referred to as the set ID.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"unii":{"pattern":"^[A-Z0-9]{10}$","description":"Unique Ingredient Identifier, which is a non-proprietary, free, unique, unambiguous, non-semantic, alphanumeric identifier based on a substance’s molecular structure and/or descriptive information.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"upc":{"description":"Universal Product Code","format":null,"is_exact":true,"possible_values":null,"type":"string"}}}},"type":"object"}',
      );
    },
    89442: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"address_1":{"description":null,"format":null,"is_exact":true,"possible_values":null,"type":"string"},"address_2":{"description":null,"format":null,"is_exact":true,"possible_values":null,"type":"string"},"center_classification_date":{"description":null,"format":"date","is_exact":false,"possible_values":null,"type":"string"},"city":{"description":"The city in which the recalling firm is located.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"classification":{"description":"Numerical designation (I, II, or III) that is assigned by FDA to a particular product recall that indicates the relative degree of health hazard.","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"Class I":"Dangerous or defective products that predictably could cause serious health problems or death. Examples include: food found to contain botulinum toxin, food with undeclared allergens, a label mix-up on a lifesaving drug, or a defective artificial heart valve.","Class II":"Products that might cause a temporary health problem, or pose only a slight threat of a serious nature. Example: a drug that is under-strength but that is not used to treat life-threatening situations.","Class III":"Products that are unlikely to cause any adverse health reaction, but that violate FDA labeling or manufacturing laws. Examples include: a minor container defect and lack of English labeling in a retail food."}},"type":"string"},"code_info":{"description":"A list of all lot and/or serial numbers, product numbers, packer or manufacturer numbers, sell or use by dates, etc., which appear on the product or its labeling.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"country":{"description":"The country in which the recalling firm is located.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"distribution_pattern":{"description":"General area of initial distribution such as, “Distributors in 6 states: NY, VA, TX, GA, FL and MA; the Virgin Islands; Canada and Japan”. The term “nationwide” is defined to mean the fifty states or a significant portion.  Note that subsequent distribution by the consignees to other parties may not be included.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"event_id":{"description":"A numerical designation assigned by FDA to a specific recall event used for tracking purposes.","format":"int64","is_exact":false,"possible_values":null,"type":"string"},"initial_firm_notification":{"description":"The method(s) by which the firm initially notified the public or their consignees of a recall. A consignee is a person or firm named in a bill of lading to whom or to whose order the product has or will be delivered.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"more_code_info":{"description":null,"format":null,"is_exact":false,"possible_values":null,"type":"string"},"openfda":{"type":"object","properties":{"application_number":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[BLA|ANDA|NDA]{3,4}[0-9]{6}$","description":"This corresponds to the NDA, ANDA, or BLA number reported by the labeler for products which have the corresponding Marketing Category designated. If the designated Marketing Category is OTC Monograph Final or OTC Monograph Not Final, then the application number will be the CFR citation corresponding to the appropriate Monograph (e.g. “part 341”). For unapproved drugs, this field will be null.","possible_values":null}},"brand_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Brand or trade name of the drug product.","possible_values":null}},"generic_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Generic name(s) of the drug product.","possible_values":null}},"is_original_packager":{"description":"Whether or not the drug has been repackaged for distribution.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"manufacturer_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Name of manufacturer or company that makes this drug product, corresponding to the labeler code segment of the NDC.","possible_values":null}},"nui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[N][0-9]{10}$","description":"Unique identifier applied to a drug concept within the National Drug File Reference Terminology (NDF-RT).","possible_values":{"type":"reference","value":{"name":"NDF-RT","link":"https://www.nlm.nih.gov/research/umls/sourcereleasedocs/current/NDFRT/"}}}},"original_packager_product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This ndc identifies the original packager.","possible_values":null}},"package_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}-[0-9]{1,2}$","description":"This number, known as the NDC, identifies the labeler, product, and trade package size. The first segment, the labeler code, is assigned by the FDA. A labeler is any firm that manufactures (including repackers or relabelers), or distributes (under its own name) the drug.","possible_values":null}},"pharm_class_cs":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Chemical structure classification of the drug product’s pharmacologic class. Takes the form of the classification, followed by `[Chemical/Ingredient]` (such as `Thiazides [Chemical/Ingredient]` or `Antibodies, Monoclonal [Chemical/Ingredient].","possible_values":null}},"pharm_class_epc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Established pharmacologic class associated with an approved indication of an active moiety (generic drug) that the FDA has determined to be scientifically valid and clinically meaningful. Takes the form of the pharmacologic class, followed by `[EPC]` (such as `Thiazide Diuretic [EPC]` or `Tumor Necrosis Factor Blocker [EPC]`.","possible_values":null}},"pharm_class_pe":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Physiologic effect or pharmacodynamic effect—tissue, organ, or organ system level functional activity—of the drug’s established pharmacologic class. Takes the form of the effect, followed by `[PE]` (such as `Increased Diuresis [PE]` or `Decreased Cytokine Activity [PE]`.","possible_values":null}},"pharm_class_moa":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"Mechanism of action of the drug—molecular, subcellular, or cellular functional activity—of the drug’s established pharmacologic class. Takes the form of the mechanism of action, followed by `[MoA]` (such as `Calcium Channel Antagonists [MoA]` or `Tumor Necrosis Factor Receptor Blocking Activity [MoA]`.","possible_values":null}},"product_ndc":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{5,4}-[0-9]{4,3}$","description":"The labeler manufacturer code and product code segments of the NDC number, separated by a hyphen.","possible_values":null}},"product_type":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":null,"possible_values":{"type":"reference","value":{"name":"Type of drug product","link":"http://www.fda.gov/ForIndustry/DataStandards/StructuredProductLabeling/ucm162063.htm"}}}},"route":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The route of administation of the drug product.","possible_values":{"type":"reference","value":{"name":"Route of administration","link":"http://www.fda.gov/ForIndustry/DataStandards/StructuredProductLabeling/ucm162034.htm"}}}},"rxcui":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[0-9]{6}$","description":"The RxNorm Concept Unique Identifier. RxCUI is a unique number that describes a semantic concept about the drug product, including its ingredients, strength, and dose forms.","possible_values":{"type":"reference","value":{"name":"RxNorm and RxCUI documentation","link":"https://www.nlm.nih.gov/research/umls/rxnorm/docs/2012/rxnorm_doco_full_2012-3.html"}}}},"spl_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for a particular version of a Structured Product Label for a product. Also referred to as the document ID.","possible_values":null}},"spl_set_id":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$","description":"Unique identifier for the Structured Product Label for a product, which is stable across versions of the label. Also referred to as the set ID.","possible_values":null}},"substance_name":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":null,"description":"The list of active ingredients of a drug product.","possible_values":null}},"unii":{"type":"array","items":{"format":null,"is_exact":true,"type":"string","pattern":"^[A-Z0-9]{10}$","description":"Unique Ingredient Identifier, which is a non-proprietary, free, unique, unambiguous, non-semantic, alphanumeric identifier based on a substance’s molecular structure and/or descriptive information.","possible_values":{"type":"reference","value":{"name":"Unique Ingredient Identifiers","link":"http://fdasis.nlm.nih.gov/srs/srs.jsp"}}}},"upc":{"type":"array","items":{"type":"string","description":"Universal Product Code","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"Universal Product Code","link":"https://en.wikipedia.org/wiki/Universal_Product_Code"}}}}}},"product_type":{"description":"The type of product being recalled. For drug queries, this will always be `Drugs`.","format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"Drugs":"The recalled product is a drug product.","Devices":"The recalled product is a device product.","Food":"The recalled product is a food product."}}},"product_code":{"description":null,"format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_description":{"description":"Brief description of the product being recalled.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_quantity":{"description":"The amount of defective product subject to recall.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reason_for_recall":{"description":"Information describing how the product is defective and violates the FD&C Act or related statutes.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"recall_initiation_date":{"description":"Date that the firm first began notifying the public or their consignees of the recall.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"recall_number":{"description":"A numerical designation assigned by FDA to a specific recall event used for tracking purposes.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"recalling_firm":{"description":"The firm that initiates a recall or, in the case of an FDA requested recall or FDA mandated recall, the firm that has primary responsibility for the manufacture and (or) marketing of the product to be recalled.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"report_date":{"description":"Date that the FDA issued the enforcement report for the product recall.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"state":{"description":"The U.S. state in which the recalling firm is located.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"status":{"description":null,"format":null,"is_exact":true,"possible_values":{"type":"one_of","value":{"On-Going":"A recall which is currently in progress.","Completed":"The recall action reaches the point at which the firm has actually retrieved and impounded all outstanding product that could reasonably be expected to be recovered, or has completed all product corrections.","Terminated":"FDA has determined that all reasonable efforts have been made to remove or correct the violative product in accordance with the recall strategy, and proper disposition has been made according to the degree of hazard.","Pending":"Actions that have been determined to be recalls, but that remain in the process of being classified."}},"type":"string"},"termination_date":{"description":null,"format":"date","is_exact":false,"possible_values":null,"type":"string"},"voluntary_mandated":{"description":"Describes who initiated the recall. Recalls are almost always voluntary, meaning initiated by a firm. A recall is deemed voluntary when the firm voluntarily removes or corrects marketed products or the FDA requests the marketed products be removed or corrected. A recall is mandated when the firm was ordered by the FDA to remove or correct the marketed products, under section 518(e) of the FD&C Act, National Childhood Vaccine Injury Act of 1986, 21 CFR 1271.440, Infant Formula Act of 1980 and its 1986 amendments, or the Food Safety Modernization Act (FSMA).","format":null,"is_exact":true,"possible_values":null,"type":"string"},"meta":{"format":null,"type":"object","description":"This section contains a disclaimer and license information. The field `last_updated` indicates when the data files were exported.","possible_values":null,"properties":{"type":"object","disclaimer":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Important details notes about openFDA data and limitations of the dataset.","possible_values":null},"license":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Link to a web page with license terms that govern data within openFDA.","possible_values":null},"last_updated":{"format":"date","is_exact":false,"type":"string","pattern":null,"description":"The last date when this openFDA endpoint was updated. Note that this does not correspond to the most recent record for the endpoint or dataset. Rather, it is the last time the openFDA API was itself updated.","possible_values":null},"results":{"type":"object","properties":{"skip":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Offset (page) of results, defined by the `skip` [query parameter](/api/).","possible_values":null},"limit":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Number of records in this return, defined by the `limit` [query parameter](/api/). If there is no `limit` parameter, the API returns one result.","possible_values":null},"total":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Total number of records matching the search criteria.","possible_values":null}}}}}},"type":"object"}',
      );
    },
    89623: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"properties":{"cfres_id":{"description":"cfRes internal recall identifier","format":null,"is_exact":false,"possible_values":null,"type":"string"},"event_date_initiated":{"description":"Date that the firm first began notifying the public or their consignees of the recall.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"event_date_created":{"description":"Date on which the recall record was created in the FDA database.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"event_date_posted":{"description":"Indicates the date FDA classified the recall, but it does not necessarily mean that the recall is new.","format":"date","is_exact":false,"possible_values":null,"type":"string"},"event_date_terminated":{"description":"Date that FDA determined recall actions were completed and terminated the recall. For details about termination of a recall see [here](http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm?fr=7.55).","format":"date","is_exact":false,"possible_values":null,"type":"string"},"recall_status":{"description":"Current status of the recall. A record in the database is created when a firm initiates a correction or removal action.  The record is updated if the FDA identifies a violation and classifies the action as a recall, and it is updated for a final time when the recall is terminated.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"recalling_firm":{"description":"The firm that initiates a recall or, in the case of an FDA requested recall or FDA mandated recall, the firm that has primary responsibility for the manufacture and (or) marketing of the product to be recalled. This field may also include the firm\'s full address (normally in case of international addresses)","format":null,"is_exact":true,"possible_values":null,"type":"string"},"firm_fei_number":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"address_1":{"description":"Street address (Line 1) of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"address_2":{"description":"Street address (Line 2) of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"city":{"description":"City of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"state":{"description":"US state of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"postal_code":{"description":"ZIP or postal code of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"country":{"description":"Country of the Recalling Firm, if available.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"additional_info_contact":{"description":"Contact information of the party that can be used to request additional information about the recall.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"reason_for_recall":{"description":"Information describing how the product is defective and violates the FD&C Act or related statutes.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"k_numbers":{"items":{"description":"FDA-assigned premarket notification number, including leading letters. Leading letters “BK” indicates 510(k) clearance, or Premarket Notification, cleared by Center for Biologics Evaluation and Research. Leading letters “DEN” indicates De Novo, or Evaluation of Automatic Class III Designation. Leading letter “K” indicates 510(k) clearance, or Premarket Notification. `Source`: 510(k)","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"openfda":{"properties":{"device_class":{"description":"A risk based classification system for all medical devices ((Federal Food, Drug, and Cosmetic Act, section 513)","format":null,"is_exact":false,"possible_values":{"type":"one_of","value":{"1":"Class I (low to moderate risk): general controls","2":"Class II (moderate to high risk): general controls and special controls","3":"Class III (high risk): general controls and Premarket Approval (PMA)","U":"Unclassified","N":"Not classified","F":"HDE"}},"type":"string"},"device_name":{"description":"This is the proprietary name, or trade name, of the cleared device.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"fei_number":{"items":{"description":"Facility identifier assigned to facility by the FDA Office of Regulatory Affairs.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"k_number":{"items":{"description":"FDA-assigned premarket notification number, including leading letters. Leading letters “BK” indicates 510(k) clearance, or Premarket Notification, cleared by Center for Biologics Evaluation and Research. Leading letters “DEN” indicates De Novo, or Evaluation of Automatic Class III Designation. Leading letter “K” indicates 510(k) clearance, or Premarket Notification. `Source`: 510(k)","format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"medical_specialty_description":{"description":"Regulation Medical Specialty is assigned based on the regulation (e.g. 21 CFR Part 888 is Orthopedic Devices) which is why Class 3 devices lack the “Regulation Medical Specialty” field.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"registration_number":{"items":{"description":null,"format":null,"is_exact":false,"possible_values":null,"type":"string"},"type":"array"},"regulation_number":{"items":{"description":"The classification regulation in the Code of Federal Regulations (CFR) under which the device is identified, described, and formally classified (Code of Federal regulations Title 21, 862.00 through 892.00). The classification regulation covers various aspects of design, clinical evaluation, manufacturing, packaging, labeling, and postmarket surveillance of the specific medical device.","format":null,"is_exact":true,"possible_values":{"type":"reference","value":{"name":"CFR database","link":"http://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/cfrsearch.cfm"}},"type":"string"},"type":"array"}},"type":"object"},"other_submission_description":{"description":"If 510(k) or PMA numbers are not applicable to the device recalled, the recall may contain other regulatory descriptions, such as `exempt`.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"pma_numbers":{"type":"array","items":{"description":"FDA-assigned premarket application number, including leading letters. Leading letter “D” indicates Product Development Protocol type of Premarket Approval. Leading letters “BP” indicates Premarket Approval by Center for Biologics Evaluation and Research. Leading letter “H” indicates Humanitarian Device Exemption approval. Leading letter “N” indicates New Drug Application. Early PMAs were approved as NDAs. Leading letter “P” indicates Premarket Approval.","format":null,"is_exact":true,"possible_values":null,"type":"string"}},"product_description":{"description":"Brief description of the product being recalled.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"code_info":{"description":"A list of all lot and/or serial numbers, product numbers, packer or manufacturer numbers, sell or use by dates, etc., which appear on the product or its labeling.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_code":{"description":"A three-letter identifier assigned to a device category. Assignment is based upon the medical device classification designated under 21 CFR Parts 862-892, and the technology and intended use of the device. Occasionally these codes are changed over time.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"product_res_number":{"description":null,"format":null,"is_exact":true,"possible_values":null,"type":"string"},"product_quantity":{"description":"The amount of defective product subject to recall.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"distribution_pattern":{"description":"General area of initial distribution such as, “Distributors in 6 states: NY, VA, TX, GA, FL and MA; the Virgin Islands; Canada and Japan”. The term “nationwide” is defined to mean the fifty states or a significant portion.  Note that subsequent distribution by the consignees to other parties may not be included.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"res_event_number":{"description":"A five digit, numerical designation assigned by FDA to a specific recall event used for tracking purposes.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"root_cause_description":{"description":"FDA determined general type of recall cause. Per FDA policy, recall cause determinations are subject to modification up to the point of termination of the recall.","format":null,"is_exact":true,"possible_values":null,"type":"string"},"action":{"description":"Action taken as part of the recall.","format":null,"is_exact":false,"possible_values":null,"type":"string"},"meta":{"format":null,"type":"object","description":"This section contains a disclaimer and license information. The field `last_updated` indicates when the data files were exported.","possible_values":null,"properties":{"type":"object","disclaimer":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Important details notes about openFDA data and limitations of the dataset.","possible_values":null},"license":{"format":null,"is_exact":false,"type":"string","pattern":null,"description":"Link to a web page with license terms that govern data within openFDA.","possible_values":null},"last_updated":{"format":"date","is_exact":false,"type":"string","pattern":null,"description":"The last date when this openFDA endpoint was updated. Note that this does not correspond to the most recent record for the endpoint or dataset. Rather, it is the last time the openFDA API was itself updated.","possible_values":null},"results":{"type":"object","properties":{"skip":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Offset (page) of results, defined by the `skip` [query parameter](/api/).","possible_values":null},"limit":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Number of records in this return, defined by the `limit` [query parameter](/api/). If there is no `limit` parameter, the API returns one result.","possible_values":null},"total":{"format":"int64","is_exact":false,"type":"number","pattern":null,"description":"Total number of records matching the search criteria.","possible_values":null}}}}}},"type":"object"}',
      );
    },
    98444: function (e) {
      "use strict";
      e.exports = JSON.parse(
        '{"device":{"510k":["regulation_number","fei_number","device_name","device_class","medical_specialty_description","registration_number"],"classification":["fei_number","registration_number","k_number","pma_number"],"enforcement":[],"event":["regulation_number","fei_number","device_name","device_class","medical_specialty_description","registration_number"],"pma":["regulation_number","fei_number","device_name","device_class","medical_specialty_description","registration_number"],"recall":["regulation_number","fei_number","device_name","k_number","device_class","medical_specialty_description","registration_number","pma_number"],"registrationlisting":["regulation_number","device_name","device_class","medical_specialty_description","k_number","pma_number"],"udi":["regulation_number","device_name","device_class","medical_specialty_description"]},"drug":{"drugsfda":["manufacturer_name","unii","product_type","spl_set_id","route","generic_name","brand_name","product_ndc","substance_name","spl_id","package_ndc","application_number","rxcui","pharm_class_moa","pharm_class_epc","pharm_class_cs","nui","pharm_class_pe"],"drugshortages":["brand_name","dosage_form","is_original_packager","manufacturer_name","nui","original_packager_product_ndc","package_ndc","pharm_class_cs","pharm_class_epc","pharm_class_moa","pharm_class_pe","product_ndc","product_type","route","rxcui","spl_id","spl_set_id","substance_name","unii","upc"],"enforcement":["manufacturer_name","unii","product_type","spl_set_id","route","generic_name","brand_name","product_ndc","substance_name","spl_id","is_original_packager","package_ndc","application_number","upc","rxcui","original_packager_product_ndc","pharm_class_moa","pharm_class_epc","pharm_class_cs","nui","pharm_class_pe"],"event":["manufacturer_name","unii","product_type","spl_set_id","route","generic_name","brand_name","product_ndc","substance_name","spl_id","package_ndc","application_number","rxcui","pharm_class_moa","pharm_class_epc","pharm_class_cs","nui","pharm_class_pe"],"label":["manufacturer_name","unii","product_type","spl_set_id","route","generic_name","brand_name","product_ndc","substance_name","spl_id","is_original_packager","package_ndc","upc","original_packager_product_ndc","application_number","rxcui","pharm_class_moa","pharm_class_epc","pharm_class_cs","nui","pharm_class_pe"],"ndc":["manufacturer_name","unii","spl_set_id","is_original_packager","upc","rxcui","pharm_class_moa","pharm_class_epc","pharm_class_cs","nui","pharm_class_pe"]},"food":{"enforcement":[],"event":[]},"other":{"nsde":[]},"transparency":{"crl":[]}}',
      );
    },
  },
]);
//# sourceMappingURL=d0132e926b5cac8ed0689b72390c899de055e911-d68165e921a96c5064f0.js.map
