/**
 * Configuration for dynamic pricing rules.
 * This can be moved to a database or environment variables later if needed.
 */
const PRICING_CONFIG = {
    AVAILABILITY: {
        HIGH_DEMAND_THRESHOLD: 80, // Percentage sold
        HIGH_DEMAND_INCREASE: 0.20, // 20%
        MID_DEMAND_THRESHOLD: 50,  // Percentage sold
        MID_DEMAND_INCREASE: 0.10   // 10%
    },
    URGENCY: {
        CRITICAL_DAYS: 2,
        CRITICAL_INCREASE: 0.20,
        WARNING_DAYS: 5,
        WARNING_INCREASE: 0.10
    },
    EARLY_BIRD: {
        THRESHOLD_DAYS: 30,
        DISCOUNT: 0.05
    }
};

/**
 * Calculates the dynamic price of an event based on availability and time remaining.
 * 
 * @param {Object} event - The event object from the database.
 * @returns {number} - The calculated dynamic price.
 */
export const calculateDynamicPrice = (event) => {
    const { price, totalTickets, ticketsAvailable, date, dynamicPricing } = event;

    // Return base price if dynamic pricing is not enabled
    if (!dynamicPricing || !dynamicPricing.enabled) {
        return price;
    }

    let dynamicPrice = price;

    // 1. Availability-based pricing
    // Percentage of tickets sold
    const soldCount = totalTickets - ticketsAvailable;
    const soldPercentage = (soldCount / totalTickets) * 100;

    if (soldPercentage > PRICING_CONFIG.AVAILABILITY.HIGH_DEMAND_THRESHOLD) {
        dynamicPrice += price * PRICING_CONFIG.AVAILABILITY.HIGH_DEMAND_INCREASE;
    } else if (soldPercentage > PRICING_CONFIG.AVAILABILITY.MID_DEMAND_THRESHOLD) {
        dynamicPrice += price * PRICING_CONFIG.AVAILABILITY.MID_DEMAND_INCREASE;
    }

    // 2. Time-based pricing
    const today = new Date();
    const eventDate = new Date(date);
    const timeDiff = eventDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysRemaining < PRICING_CONFIG.URGENCY.CRITICAL_DAYS && daysRemaining >= 0) {
        dynamicPrice += price * PRICING_CONFIG.URGENCY.CRITICAL_INCREASE;
    } else if (daysRemaining < PRICING_CONFIG.URGENCY.WARNING_DAYS && daysRemaining >= 0) {
        dynamicPrice += price * PRICING_CONFIG.URGENCY.WARNING_INCREASE;
    }

    // 3. Early-bird discount
    if (daysRemaining > PRICING_CONFIG.EARLY_BIRD.THRESHOLD_DAYS) {
        dynamicPrice -= price * PRICING_CONFIG.EARLY_BIRD.DISCOUNT;
    }

    // 4. Ensure price stays within defined range
    if (dynamicPricing.minPrice !== undefined && dynamicPrice < dynamicPricing.minPrice) {
        dynamicPrice = dynamicPricing.minPrice;
    }
    if (dynamicPricing.maxPrice !== undefined && dynamicPrice > dynamicPricing.maxPrice) {
        dynamicPrice = dynamicPricing.maxPrice;
    }

    // Round to 2 decimal places for currency
    return Math.round(dynamicPrice * 100) / 100;
};
