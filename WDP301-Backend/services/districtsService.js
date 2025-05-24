const axios = require("axios");

console.log("Loading districtsService.js version 2025-05-24-ghn-hcmc-districts-api-fix-token");

// GHN API configuration
const GHN_API_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district";
const GHN_TOKEN = "bce09ec7-38b5-11f0-9b81-222185cb68c8"; // Updated with the provided GHN token
const HCMC_PROVINCE_ID = 202;

// Function to map GHN district type to our desired format
const mapDistrictType = (type) => {
  switch (type) {
    case 1:
      return "urban district";
    case 2:
      return "rural district";
    case 3:
      return "city";
    default:
      return "unknown";
  }
};

// Function to get HCMC districts from GHN API
const getAllDistricts = async () => {
  try {
    console.log("Fetching HCMC districts from GHN API");
    const response = await axios.get(GHN_API_URL, {
      headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN, // Using "Token" as per GHN API documentation
      },
      params: {
        province_id: HCMC_PROVINCE_ID,
      },
    });

    console.log("GHN API Response:", {
      status: response.status,
      data: response.data,
    });

    if (response.data.code !== 200 || !response.data.data) {
      throw new Error(`GHN API request failed: ${response.data.message || "No data returned"}`);
    }

    const districts = response.data.data.map((district) => ({
      name: district.DistrictName,
      type: mapDistrictType(district.Type),
    }));

    console.log("HCMC districts retrieved successfully:", districts);
    return districts;
  } catch (error) {
    console.error("GHN API Error Details:", {
      message: error.message,
      response: error.response ? error.response.data : "No response data",
      status: error.response ? error.response.status : "No status",
    });
    throw new Error("Failed to retrieve HCMC districts from GHN API");
  }
};

module.exports = { getAllDistricts };
