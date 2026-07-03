export default function getNotificationCount(title) {
  const match = title.match(/^\[(?<count>[^\]]*)\]/v);

  if (!match) {
    return undefined;
  }

  const digits = match.groups.count.replaceAll(/\D/gv, "");
  return digits.length > 0 ? Number(digits) : 0;
}
