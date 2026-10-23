"""Ajusta los cortes del Reel al beat más cercano (±150 ms) de clips/audio.mp3.
Uso: python3 scripts/ajustar_beat.py <audio> "0,2,6,9,12,15"  ->  imprime los cortes ajustados
Detección de onsets por flujo espectral (numpy); los cortes se redondean a cuadros de 30 fps."""
import subprocess, sys
import numpy as np

SR, HOP, WIN, FPS, TOL = 22050, 256, 1024, 30, 0.150

audio, cortes = sys.argv[1], [float(c) for c in sys.argv[2].split(",")]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-t", str(cortes[-1] + 1), "-ac", "1",
                      "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.float32)
n = 1 + max(0, len(x) - WIN) // HOP
frames = np.lib.stride_tricks.as_strided(x, (n, WIN), (x.strides[0] * HOP, x.strides[0]))
mag = np.log1p(np.abs(np.fft.rfft(frames * np.hanning(WIN), axis=1)))
flux = np.maximum(np.diff(mag, axis=0), 0).sum(axis=1)
flux = flux - np.convolve(flux, np.ones(16) / 16, mode="same")  # quita la tendencia lenta
t = ((np.arange(len(flux)) + 1) * HOP + WIN / 2) / SR  # centro de la ventana

out = [cortes[0]]
for c in cortes[1:-1]:
    m = np.abs(t - c) <= TOL
    nuevo = t[m][np.argmax(flux[m])] if m.any() and flux[m].max() > 0 else c
    out.append(round(nuevo * FPS) / FPS)
out.append(cortes[-1])
print(",".join(f"{v:.4f}" for v in out))
