import pool from "../config/db.js";

// Haversine formula to compute distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export async function computeDriverEarnings(orderId, connection = pool) {
  const [rows] = await connection.query(
    `SELECT o.id, o.placed_at,
            ra.latitude as rest_lat, ra.longitude as rest_lng,
            da.latitude as del_lat, da.longitude as del_lng
     FROM orders o
     JOIN restaurants r ON o.restaurant_id = r.id
     JOIN addresses ra ON r.address_id = ra.id
     JOIN addresses da ON o.delivery_address_id = da.id
     WHERE o.id = ?`,
    [orderId],
  );

  if (rows.length === 0) return null;
  const order = rows[0];

  const dist = calculateDistance(
    parseFloat(order.rest_lat || "12.9716"),
    parseFloat(order.rest_lng || "77.5946"),
    parseFloat(order.del_lat || "12.9716"),
    parseFloat(order.del_lng || "77.5946"),
  );

  const basePay = 30.0;
  const distancePay = parseFloat((dist * 12.0).toFixed(2)); // ₹12 per km
  const timePay = 15.0; // Flat time pay
  const waitingCharges = 5.0;
  const pickupBonus = 5.0;

  const hour = new Date().getHours();
  const isPeak = (hour >= 12 && hour <= 15) || (hour >= 19 && hour <= 22);
  const peakHourBonus = isPeak ? 20.0 : 0.0;

  const rainBonus = Math.random() > 0.75 ? 25.0 : 0.0;
  const isNight = hour >= 23 || hour <= 5;
  const nightBonus = isNight ? 30.0 : 0.0;

  const zoneMultiplier = 1.1;
  const surgeIncentive = isPeak ? 10.0 : 0.0;
  const tip = Math.random() > 0.6 ? 20.0 : 0.0;

  const breakdown = {
    base_pay: basePay,
    distance_pay: distancePay,
    time_pay: timePay,
    waiting_charges: waitingCharges,
    pickup_bonus: pickupBonus,
    peak_hour_bonus: peakHourBonus,
    rain_bonus: rainBonus,
    night_bonus: nightBonus,
    zone_multiplier_bonus: parseFloat(
      ((basePay + distancePay) * (zoneMultiplier - 1)).toFixed(2),
    ),
    surge_incentive: surgeIncentive,
    tip: tip,
    penalty: 0.0,
    cancellation_deduction: 0.0,
  };

  const total = Object.values(breakdown).reduce((acc, val) => acc + val, 0);

  return {
    breakdown,
    total: parseFloat(total.toFixed(2)),
    distance: dist,
  };
}
