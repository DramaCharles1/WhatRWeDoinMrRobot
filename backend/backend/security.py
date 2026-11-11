SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "same-origin",
}


def apply_security_headers(response):
    for key, value in SECURITY_HEADERS.items():
        response[key] = value
    return response
