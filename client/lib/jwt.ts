// decodeJWT: decode payload của JWT không cần thư viện ngoài (chỉ dùng cho demo, không kiểm tra chữ ký)
export function decodeJWT(token: string): any {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
