const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    // Copy req.query:
    const reqQuery = { ...req.query };

    // Fields to exclude from the filters:
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields adn delete them from reqQuery:
    removeFields.forEach( param => delete reqQuery[param]);

    // Create query string and Add $ to operators in order for MongodB to filter
    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Find resource
    query = model.find(JSON.parse(queryString));

    console.log(req.query);
    // Select Fields:
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        console.log('selected fields'.yellow,fields);
        query = query.select(fields);
    }
    // Sort Fields:
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        console.log('sorted fields '.yellow, sortBy);
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination Fields
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
    const totalPages = total / limit > 1 ? total / limit : 1;

    query = query.skip(startIndex).limit(limit);

    if(populate) {
        query = query.populate(populate);
    }

    const result = await query;

    // Pagination result:
    const pagination = {}
    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResults = {
        success: true,
        count: result.length,
        pagination,
        data: result,
        total,
        totalPages,
    }

    next();
}

module.exports = advancedResults;