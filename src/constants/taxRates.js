/**
 * Default tax rates for Germany (2025/2026)
 */
export const DEFAULT_TAX_RATES = {
  /** Meal allowance for trips > 8 hours */
  mealRate8h: 14.0,
  /** Meal allowance for trips > 24 hours */
  mealRate24h: 28.0,
  /** General mileage rate (legacy) */
  mileageRate: 0.30,
  /** Mileage rate for cars */
  mileageRateCar: 0.30,
  /** Mileage rate for motorcycles */
  mileageRateMotorcycle: 0.20,
  /** Mileage rate for bikes */
  mileageRateBike: 0.05,
  /** GWG limit (Geringwertige Wirtschaftsgüter) */
  gwgLimit: 952.0
};

/**
 * Vehicle types for mileage calculations
 */
export const VEHICLE_TYPES = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  BIKE: 'bike',
  PUBLIC_TRANSPORT: 'public_transport'
};

/**
 * Get mileage rate for vehicle type
 * @param {string} vehicleType - Type of vehicle
 * @param {Object} customRates - Custom tax rates (optional)
 * @returns {number} Mileage rate per km
 */
export const getMileageRateForVehicle = (vehicleType, customRates = DEFAULT_TAX_RATES) => {
  switch (vehicleType) {
    case VEHICLE_TYPES.MOTORCYCLE:
      return customRates.mileageRateMotorcycle || DEFAULT_TAX_RATES.mileageRateMotorcycle;
    case VEHICLE_TYPES.BIKE:
      return customRates.mileageRateBike || DEFAULT_TAX_RATES.mileageRateBike;
    case VEHICLE_TYPES.CAR:
    default:
      return customRates.mileageRateCar || DEFAULT_TAX_RATES.mileageRateCar;
  }
};
