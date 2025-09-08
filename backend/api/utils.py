import qrcode

def generate_qr_for_staff(staff, domain="http://localhost:3000"):
    url = f"{domain}/new-applicant?staff_ref_code={staff.ref_code}"
    img = qrcode.make(url)
    filename = f"{staff.username}_qr.png"
    img.save(filename)
    return filename, url
