package com.zelthia.app.ui.main

import android.animation.ValueAnimator
import android.content.res.Configuration
import android.os.Build
import android.provider.Settings
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.LocalIndication
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation3.runtime.NavKey
import com.zelthia.app.R
import com.zelthia.app.data.DefaultDataRepository
import com.zelthia.app.ui.theme.ZelthiaTheme

@Composable
fun MainScreen(
  onItemClick: (NavKey) -> Unit,
  modifier: Modifier = Modifier,
  viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) },
) {
  val uiState by viewModel.uiState.collectAsStateWithLifecycle()
  val reducedMotion = rememberReducedMotion()

  when (val state = uiState) {
    MainScreenUiState.Loading -> {
      LoadingState(modifier = modifier)
    }
    is MainScreenUiState.Success -> {
      MainScreen(
        data = state.data,
        modifier = modifier,
        reducedMotion = reducedMotion,
      )
    }
    is MainScreenUiState.Error -> {
      ErrorState(
        message = state.throwable.message ?: "Something interrupted loading your health tools.",
        reducedMotion = reducedMotion,
        modifier = modifier,
      )
    }
  }
}

@Composable
internal fun MainScreen(
  data: List<String>,
  modifier: Modifier = Modifier,
  onItemSelect: (String) -> Unit = {},
  reducedMotion: Boolean = rememberReducedMotion(),
) {
  Scaffold(
    modifier = modifier.fillMaxSize(),
    contentWindowInsets = WindowInsets.safeDrawing,
    containerColor = MaterialTheme.colorScheme.background,
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .verticalScroll(rememberScrollState()),
      contentAlignment = Alignment.TopCenter,
    ) {
      Column(
        modifier = Modifier
          .widthIn(max = 560.dp)
          .fillMaxWidth()
          .padding(horizontal = 24.dp, vertical = 28.dp),
      ) {
        Text(
          text = stringResource(R.string.app_name),
          style = MaterialTheme.typography.displaySmall,
          color = MaterialTheme.colorScheme.onBackground,
          modifier = Modifier.semantics { heading() },
        )
        Spacer(modifier = Modifier.height(10.dp))
        Text(
          text = "Health guidance, prescription reading, and verified nearby pharmacy stock.",
          style = MaterialTheme.typography.bodyLarge,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(28.dp))
        if (data.isEmpty()) {
          Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Text(
              text = "No tools available right now.",
              style = MaterialTheme.typography.bodyLarge,
              color = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.padding(horizontal = 20.dp, vertical = 20.dp),
            )
          }
        } else {
          Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
            modifier = Modifier.fillMaxWidth(),
          ) {
            Column(modifier = Modifier.fillMaxWidth()) {
              data.forEachIndexed { index, item ->
                CompanionRow(
                  label = item,
                  reducedMotion = reducedMotion,
                  onClick = { onItemSelect(item) },
                )
                if (index < data.lastIndex) {
                  HorizontalDivider(
                    thickness = 1.dp,
                    color = MaterialTheme.colorScheme.outlineVariant,
                    modifier = Modifier.padding(horizontal = 20.dp),
                  )
                }
              }
            }
          }
        }
      }
    }
  }
}

@Composable
private fun CompanionRow(
  label: String,
  reducedMotion: Boolean,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
) {
  val interactionSource = remember { MutableInteractionSource() }
  val pressed by interactionSource.collectIsPressedAsState()

  Row(
    modifier = modifier
      .fillMaxWidth()
      .heightIn(min = 56.dp)
      .pressScale(pressed = pressed, targetScale = 0.985f, reducedMotion = reducedMotion)
      .clickable(
        interactionSource = interactionSource,
        indication = LocalIndication.current,
        role = Role.Button,
        onClick = onClick,
      )
      .padding(horizontal = 20.dp, vertical = 16.dp),
    verticalAlignment = Alignment.CenterVertically,
    horizontalArrangement = Arrangement.SpaceBetween,
  ) {
    Text(
      text = label,
      style = MaterialTheme.typography.titleMedium,
      color = MaterialTheme.colorScheme.onSurface,
      modifier = Modifier.weight(1f).padding(end = 16.dp),
    )
    ChevronRight(color = MaterialTheme.colorScheme.onSurfaceVariant)
  }
}

@Composable
private fun LoadingState(modifier: Modifier = Modifier) {
  Scaffold(
    modifier = modifier.fillMaxSize(),
    contentWindowInsets = WindowInsets.safeDrawing,
    containerColor = MaterialTheme.colorScheme.background,
  ) { innerPadding ->
    Box(
      modifier = Modifier.fillMaxSize().padding(innerPadding),
      contentAlignment = Alignment.Center,
    ) {
      CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
    }
  }
}

@Composable
private fun ErrorState(
  message: String,
  reducedMotion: Boolean,
  modifier: Modifier = Modifier,
  onRetry: () -> Unit = {},
) {
  val interactionSource = remember { MutableInteractionSource() }
  val pressed by interactionSource.collectIsPressedAsState()

  Scaffold(
    modifier = modifier.fillMaxSize(),
    contentWindowInsets = WindowInsets.safeDrawing,
    containerColor = MaterialTheme.colorScheme.background,
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .padding(horizontal = 24.dp),
      contentAlignment = Alignment.Center,
    ) {
      Column(
        modifier = Modifier.widthIn(max = 420.dp).fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
      ) {
        Text(
          text = "Unable to load Zelthia",
          style = MaterialTheme.typography.titleLarge,
          color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
          text = message,
          style = MaterialTheme.typography.bodyLarge,
          color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.height(4.dp))
        FilledTonalButton(
          onClick = onRetry,
          interactionSource = interactionSource,
          modifier = Modifier
            .heightIn(min = 48.dp)
            .pressScale(pressed = pressed, targetScale = 0.97f, reducedMotion = reducedMotion),
        ) {
          Text(
            text = "Try again",
            style = MaterialTheme.typography.labelLarge,
          )
        }
      }
    }
  }
}

@Composable
private fun ChevronRight(
  color: Color,
  modifier: Modifier = Modifier,
) {
  val isRtl = LocalLayoutDirection.current == LayoutDirection.Rtl
  Canvas(modifier = modifier.size(16.dp)) {
    val startX = if (isRtl) size.width * 0.64f else size.width * 0.36f
    val tipX = if (isRtl) size.width * 0.32f else size.width * 0.68f
    val path = Path().apply {
      moveTo(startX, size.height * 0.22f)
      lineTo(tipX, size.height * 0.50f)
      lineTo(startX, size.height * 0.78f)
    }
    drawPath(
      path = path,
      color = color,
      style = Stroke(
        width = 1.75.dp.toPx(),
        cap = StrokeCap.Round,
        join = StrokeJoin.Round,
      ),
    )
  }
}

@Composable
private fun Modifier.pressScale(
  pressed: Boolean,
  targetScale: Float = 0.985f,
  reducedMotion: Boolean = false,
): Modifier {
  val scale by animateFloatAsState(
    targetValue = if (pressed && !reducedMotion) targetScale else 1f,
    animationSpec = spring(
      dampingRatio = Spring.DampingRatioNoBouncy,
      stiffness = Spring.StiffnessMedium,
    ),
    label = "pressScale",
  )
  return if (reducedMotion) {
    this
  } else {
    graphicsLayer {
      scaleX = scale
      scaleY = scale
    }
  }
}

@Composable
private fun rememberReducedMotion(): Boolean {
  val context = LocalContext.current
  return remember(context) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      !ValueAnimator.areAnimatorsEnabled()
    } else {
      Settings.Global.getFloat(
        context.contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        1f,
      ) == 0f
    }
  }
}

@Preview(name = "Light", showBackground = true, showSystemUi = true)
@Composable
fun MainScreenLightPreview() {
  ZelthiaTheme(darkTheme = false) {
    MainScreen(
      data = listOf("AI Health Chat", "Doctor's Note Reader", "Medicine & Test Finder"),
    )
  }
}

@Preview(
  name = "Dark",
  showBackground = true,
  showSystemUi = true,
  uiMode = Configuration.UI_MODE_NIGHT_YES,
)
@Composable
fun MainScreenDarkPreview() {
  ZelthiaTheme(darkTheme = true) {
    MainScreen(
      data = listOf("AI Health Chat", "Doctor's Note Reader", "Medicine & Test Finder"),
    )
  }
}
