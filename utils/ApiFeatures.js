// Refacoring app features
module.exports = class ApiFeatures {
  constructor(mongoQuery, reqQuery) {
    this.mongoQuery = mongoQuery;
    this.reqQuery = reqQuery;
  }


  filter() {
    const queryObj = { ...this.reqQuery };
    let excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);


    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    })

    this.mongoQuery = this.mongoQuery.find(JSON.parse(queryStr));
    return this;
  }


  sort() {
    // 2) Sorting
    if (this.reqQuery.sort) {
      //In the query param that we are sending from postman, sorting params are seperated by (,), replace them with (' '), as it the standard taken by sort() mongoose function
      const sortBy = this.reqQuery.sort.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.sort(sortBy);
      //if price is same sort by ratingsAverage
      // sort('price ratingsAverage')
    }
    else {
      //default sorting by creation time so that latest added tours appear first
      this.mongoQuery = this.mongoQuery.sort('-createdAt');
    }
    return this;
  }


  limitFields() {
    // 3) Field limiting
    // Limit the response data to required fields given by the user only
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(',').join(' ');
      this.mongoQuery = this.mongoQuery.select(fields);
    } else {
      //If no field parameter provided then select all default fields except __v
      this.mongoQuery = this.mongoQuery.select('-__v');// excluded the __v from the document
    }
    return this;
  }


  paginate() {
    // 4) Pagination

    // skip(num) skip <num> no. of documents before querying data
    // limit() no. of documents can be limited by this
    // page=2 & limit=5 ==> Skip 5 docs and then return next 5
    // ==> query.skip((page-1)*limit).limit(limit)
    const page = this.reqQuery.page * 1 || 1;
    const limit = this.reqQuery.limit * 1 || 100;

    const skip = (page - 1) * limit;

    // Example query : query.skip(2).limit(5)
    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    return this;
  }
}