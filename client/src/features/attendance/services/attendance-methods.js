export function normalizeAttendanceMethod(value) {
  if (typeof value !== "string") {
    return "both";
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "qr" || normalizedValue === "code" || normalizedValue === "both") {
    return normalizedValue;
  }

  return "both";
}

export function isAttendanceMethodAllowed(sessionMethod, attemptMethod) {
  const normalizedSessionMethod = normalizeAttendanceMethod(sessionMethod);
  const normalizedAttemptMethod = normalizeAttendanceMethod(attemptMethod);

  if (normalizedSessionMethod === "both") {
    return normalizedAttemptMethod === "qr" || normalizedAttemptMethod === "code";
  }

  return normalizedSessionMethod === normalizedAttemptMethod;
}

export function getMethodRestrictions(sessionMethod) {
  const normalizedSessionMethod = normalizeAttendanceMethod(sessionMethod);

  return {
    qr: normalizedSessionMethod === "qr" || normalizedSessionMethod === "both",
    code: normalizedSessionMethod === "code" || normalizedSessionMethod === "both",
  };
}

export function getAttendanceMethodLabel(method) {
  switch (normalizeAttendanceMethod(method)) {
    case "qr":
      return "QR Only";
    case "code":
      return "Code Only";
    default:
      return "QR + Code";
  }
}
