package com.zelthia.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = BrandDark,
    onPrimary = PaperDark,
    primaryContainer = BrandSoftDark,
    onPrimaryContainer = BrandStrongDark,
    secondary = SkyDark,
    onSecondary = PaperDark,
    secondaryContainer = SkySoftDark,
    onSecondaryContainer = InkDark,
    background = PaperDark,
    onBackground = InkDark,
    surface = SurfaceDark,
    onSurface = InkDark,
    surfaceVariant = MistDark,
    onSurfaceVariant = MutedDark,
    surfaceContainerLowest = PaperDark,
    surfaceContainerLow = SurfaceDark,
    surfaceContainer = MistDark,
    surfaceContainerHigh = SurfaceHighDark,
    surfaceContainerHighest = LineDark,
    outline = MutedDark,
    outlineVariant = LineDark,
    error = AlertDark,
    onError = PaperDark,
    errorContainer = AlertSoftDark,
    onErrorContainer = InkDark,
)

private val LightColorScheme = lightColorScheme(
    primary = BrandLight,
    onPrimary = SurfaceLight,
    primaryContainer = BrandSoftLight,
    onPrimaryContainer = BrandStrongLight,
    secondary = SkyLight,
    onSecondary = SurfaceLight,
    secondaryContainer = SkySoftLight,
    onSecondaryContainer = InkLight,
    background = PaperLight,
    onBackground = InkLight,
    surface = SurfaceLight,
    onSurface = InkLight,
    surfaceVariant = MistLight,
    onSurfaceVariant = MutedLight,
    surfaceContainerLowest = SurfaceLight,
    surfaceContainerLow = PaperLight,
    surfaceContainer = PaperDimLight,
    surfaceContainerHigh = MistLight,
    surfaceContainerHighest = LineLight,
    outline = MutedLight,
    outlineVariant = LineLight,
    error = AlertLight,
    onError = SurfaceLight,
    errorContainer = AlertSoftLight,
    onErrorContainer = InkLight,
)

@Composable
fun ZelthiaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content,
    )
}
