from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
import cv2
import numpy as np
from typing import List, Tuple

router = APIRouter()

# Use OpenCV's built-in Haar cascade for faces
_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def _read_image_bytes_to_bgr(data: bytes) -> np.ndarray:
  arr = np.frombuffer(data, dtype=np.uint8)
  img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
  if img is None:
    raise ValueError("Invalid image data")
  return img


def _gaussian_blur_regions(img: np.ndarray, boxes: List[Tuple[int, int, int, int]], ksize: int = 51) -> np.ndarray:
  out = img.copy()
  for (x, y, w, h) in boxes:
    pad = max(4, int(0.05 * max(w, h)))
    x0 = max(0, x - pad)
    y0 = max(0, y - pad)
    x1 = min(out.shape[1], x + w + pad)
    y1 = min(out.shape[0], y + h + pad)
    roi = out[y0:y1, x0:x1]
    if roi.size == 0:
      continue
    blurred = cv2.GaussianBlur(roi, (ksize | 1, ksize | 1), 0)
    out[y0:y1, x0:x1] = blurred
  return out


@router.post("/blur")
async def blur_image(image: UploadFile = File(...)):
  if not (image.content_type or "").startswith("image/"):
    raise HTTPException(status_code=400, detail="Only image uploads are accepted")
  data = await image.read()
  bgr = _read_image_bytes_to_bgr(data)
  gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
  faces = _cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
  blurred = _gaussian_blur_regions(bgr, faces.tolist() if isinstance(faces, np.ndarray) else [])
  ok, buf = cv2.imencode('.png', blurred)
  if not ok:
    raise HTTPException(status_code=500, detail="Failed to encode image")
  # Return image bytes with simple counts via headers
  headers = {"X-Face-Count": str(len(faces))}
  return Response(content=bytes(buf), media_type="image/png", headers=headers)
