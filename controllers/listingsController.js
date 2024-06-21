const Listing = require('../models/Listing');

exports.searchListings = async (req, res) => {
  try {
    const { name, property_type, page, pageSize, limit } = req.query;

    // Convert page, pageSize, and limit to integers and set default values if necessary
    const pageNumber = parseInt(page, 10) || 1;
    const pageSizeNumber = parseInt(pageSize, 10) || 10;
    const limitNumber = parseInt(limit, 10);

    // If a limit is specified in the query, use it; otherwise, use pageSizeNumber
    const finalLimit = limitNumber > 0 ? limitNumber : pageSizeNumber;

    // Initialize matchQuery as an empty object
    let matchQuery = {};

    // Conditionally add filters to matchQuery
    if (name) {
      matchQuery.name = { $regex: name, $options: 'i' };
    }

    if (property_type) {
      matchQuery.property_type = property_type;
    }

    // If no search criteria are provided, set default limit to 50
    const defaultLimit = (!name && !property_type) ? 50 : finalLimit;

    const aggregationPipeline = [
      { $match: matchQuery },
      { $sort: { property_type: 1 } }, // Sort by property_type ascending
      { 
        $facet: {
          metadata: [
            { $count: "totalResults" }
          ],
          data: [
            { $skip: (pageNumber - 1) * defaultLimit },
            { $limit: defaultLimit },
            { 
              $project: { 
                _id: 0, 
                property_type: 1, 
                name: 1 
              } 
            },
          ]
        }
      },
      { 
        $project: {
          totalResults: { $arrayElemAt: ["$metadata.totalResults", 0] },
          results: "$data"
        }
      }
    ];

    const aggregationResult = await Listing.aggregate(aggregationPipeline);

    if (!aggregationResult || aggregationResult.length === 0 || !aggregationResult[0].results.length) {
      return res.status(404).json({ message: 'No listings found' });
    }

    // Extract totalResults and results from the aggregation result
    const { totalResults, results } = aggregationResult[0];

    res.json({
      totalResults,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalResults / defaultLimit),
      results,
    });
  } catch (err) {
    console.error('Error searching and aggregating listings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
