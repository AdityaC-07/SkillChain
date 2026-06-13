"""Certificate PDF generator and QR utilities.

Generates a print-quality A4-landscape certificate PDF using ReportLab,
creates QR codes with `qrcode`, and embeds QR into the PDF using PyPDF2.
"""
from __future__ import annotations

import io
from datetime import datetime
from typing import Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
import qrcode
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter


class CertificateGenerator:
    # A4 landscape
    PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)

    def generate_certificate_pdf(self, cert_data: Dict[str, str]) -> bytes:
        """Generate a professional certificate PDF and return bytes.

        `cert_data` keys: learner_name, course_name, institution_name, completion_date,
        grade, certificate_id, issued_by, issued_at (ISO) etc.
        """
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT))

        # Background
        c.setFillColor(colors.HexColor("#FAFAF5"))
        c.rect(0, 0, self.PAGE_WIDTH, self.PAGE_HEIGHT, fill=1, stroke=0)

        # Outer double border
        margin = 20 * mm
        c.setLineWidth(6)
        c.setStrokeColor(colors.HexColor("#FFBF00"))
        c.rect(margin, margin, self.PAGE_WIDTH - 2 * margin, self.PAGE_HEIGHT - 2 * margin)
        c.setLineWidth(2)
        c.setStrokeColor(colors.HexColor("#0B3D91"))
        c.rect(margin + 6, margin + 6, self.PAGE_WIDTH - 2 * (margin + 6), self.PAGE_HEIGHT - 2 * (margin + 6))

        # Header: SKILLCHAIN logo text
        c.setFillColor(colors.HexColor("#0B3D91"))
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 60, "SKILLCHAIN")

        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 78, "National Council for Vocational Education & Training")

        # Decorative divider
        c.setStrokeColor(colors.HexColor("#FFBF00"))
        c.setLineWidth(3)
        c.line(120, self.PAGE_HEIGHT - 100, self.PAGE_WIDTH - 120, self.PAGE_HEIGHT - 100)

        # Title
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(colors.HexColor("#0B3D91"))
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 160, "CERTIFICATE OF COMPLETION")

        # Sub text
        c.setFont("Helvetica-Oblique", 14)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 190, "This is to certify that")

        # Learner name
        c.setFont("Helvetica-Bold", 36)
        c.setFillColor(colors.HexColor("#0B3D91"))
        learner_name = cert_data.get("learner_name", "")
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 240, learner_name)
        # underline
        text_width = c.stringWidth(learner_name, "Helvetica-Bold", 36)
        c.setLineWidth(1.5)
        c.line(self.PAGE_WIDTH / 2 - text_width / 2, self.PAGE_HEIGHT - 250, self.PAGE_WIDTH / 2 + text_width / 2, self.PAGE_HEIGHT - 250)

        # Completed course text
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 280, "has successfully completed the")

        # Course name
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor("#FFBF00"))
        c.drawCentredString(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT - 315, cert_data.get("course_name", ""))

        # Grade badge
        grade = cert_data.get("grade", "")
        badge_w, badge_h = 120, 30
        badge_x = self.PAGE_WIDTH / 2 - badge_w / 2
        badge_y = self.PAGE_HEIGHT - 360
        c.setFillColor(colors.HexColor("#0B3D91"))
        c.rect(badge_x, badge_y, badge_w, badge_h, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(self.PAGE_WIDTH / 2, badge_y + 8, f"Grade: {grade}")

        # Institution and date
        c.setFont("Helvetica", 12)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawString(margin + 20, margin + 60, f"Issued by: {cert_data.get('institution_name', '')}")
        # formatted date
        try:
            dt = datetime.fromisoformat(cert_data.get("completion_date"))
            date_str = dt.strftime("%d %B %Y")
        except Exception:
            date_str = cert_data.get("completion_date", "")
        c.drawRightString(self.PAGE_WIDTH - margin - 20, margin + 60, f"Completion Date: {date_str}")

        # Footer columns
        # Left: Certificate ID
        c.setFont("Courier", 9)
        c.setFillColor(colors.HexColor("#374151"))
        cid = cert_data.get("certificate_id", "")
        c.drawString(margin + 10, margin + 20, f"Certificate ID: {cid}")

        # Center: QR placeholder box
        qr_box_w = 80
        qr_box_x = self.PAGE_WIDTH / 2 - qr_box_w / 2
        c.setStrokeColor(colors.HexColor("#9CA3AF"))
        c.rect(qr_box_x, margin + 10, qr_box_w, qr_box_w, fill=0)
        c.setFont("Helvetica", 8)
        c.drawCentredString(self.PAGE_WIDTH / 2, margin + 6, "Scan to Verify")

        # Right: Blockchain badge text
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#6B7280"))
        c.drawRightString(self.PAGE_WIDTH - margin - 10, margin + 20, "Verified on Polygon Blockchain")

        # Watermark
        c.saveState()
        c.translate(self.PAGE_WIDTH / 2, self.PAGE_HEIGHT / 2)
        c.rotate(30)
        c.setFont("Helvetica-Bold", 40)
        c.setFillColor(colors.Color(0, 0, 0, alpha=0.05))
        c.drawCentredString(0, 0, "SKILLCHAIN VERIFIED")
        c.restoreState()

        # Small badge
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.HexColor("#0B3D91"))
        c.drawRightString(self.PAGE_WIDTH - margin - 10, margin + qr_box_w + 20, "Blockchain Secured")

        c.showPage()
        c.save()

        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    def generate_qr_code(self, certificate_id: str, frontend_url: str) -> bytes:
        """Generate a styled QR code PNG as bytes.

        Encodes: {frontend_url}/verify/{certificate_id}
        """
        url = f"{frontend_url.rstrip('/')}/verify/{certificate_id}"
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=6, border=2)
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#FFBF00", back_color="white").convert("RGB")

        buf = io.BytesIO()
        img = img.resize((200, 200))
        img.save(buf, format="PNG")
        return buf.getvalue()

    def embed_qr_in_certificate(self, pdf_bytes: bytes, qr_bytes: bytes) -> bytes:
        """Overlay the QR PNG onto the certificate PDF at bottom-center and return new PDF bytes."""
        # Read original PDF
        original = PdfReader(io.BytesIO(pdf_bytes))
        writer = PdfWriter()

        # Create a PDF page with the QR image at correct position
        from reportlab.pdfgen import canvas as rl_canvas
        from reportlab.lib.pagesizes import landscape, A4

        packet = io.BytesIO()
        c = rl_canvas.Canvas(packet, pagesize=(self.PAGE_WIDTH, self.PAGE_HEIGHT))

        # Draw QR image centered in footer area
        qr_img = Image.open(io.BytesIO(qr_bytes))
        qr_w, qr_h = 200, 200
        x = (self.PAGE_WIDTH - qr_w) / 2
        y = 30  # margin from bottom
        c.drawInlineImage(qr_img, x, y, qr_w, qr_h)
        c.save()
        packet.seek(0)
        overlay_pdf = PdfReader(packet)

        # Merge overlay onto first page
        page0 = original.pages[0]
        overlay_page = overlay_pdf.pages[0]
        page0.merge_page(overlay_page)
        writer.add_page(page0)

        # If original had more pages, append them
        for p in original.pages[1:]:
            writer.add_page(p)

        out_buf = io.BytesIO()
        writer.write(out_buf)
        return out_buf.getvalue()


certificate_generator = CertificateGenerator()
