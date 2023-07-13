const catchAsync = require('../utils/CatchAsync')
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures')


// It is a generic delete controller which will be called whenever any delete method is called from any controller

exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    // try {
    const reqId = req.params.id;
    const document = await Model.findByIdAndDelete(reqId);

    if (!document) {
        return next(new AppError(`No document found with id: ${reqId}`, 404));
    }

    res.status(204).json({
        status: 'success',
    })

});


// factory function for updation of documents
exports.updateOne = Model => catchAsync(async (req, res, next) => {

    // try {
    const reqId = req.params.id;

    //find doc by id and update the doc
    const updatedDocument = await Model.findByIdAndUpdate(reqId, req.body, {
        //To return the new updated doc as response
        new: true,
        // validation takes place again before updation in database
        runValidators: true
    });


    if (!updatedDocument) {
        return next(new AppError(`No document is found with id : ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: updatedDocument
        }
    });

})


// factory function for creation of documents
exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
            data: newDocument
        }
    })

})


exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    //variables are present in req.params wrapped in an object

    console.log(req.params);

    const reqId = req.params.id;


    let query = Model.findOne({ _id: req.params.id });

    // if population is required
    if (populateOptions) query = query.populate(populateOptions);

    const document =
        // await Tour.findById(reqId);
        await query;
    // ? populate() populates the field specified in the path with data from the model defined in the ref in the parent schema
    // ! We will use query middleware for this
    // .populate({
    //   path: 'guides',
    //   select: '-__v -passwordChangedAt'
    // });

    if (!document) {
        return next(new AppError(`No document found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: document
        }
    })

})



exports.getAll = Model => catchAsync(async (req, res, next) => {

    // try {

    // to allow for nested get reviews on tour
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // EXECUTE QUERY
    const features = new ApiFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // const query = Tour.find()
    // .where('duration').equals(5)
    // .where('difficulty').equals('easy');


    const documents = await features.mongoQuery;
    // query.sort().select().skip().limit()
    // All these methods return query which can ba again chained with other query methods and then awaited to get our final results

    //SEND RESPONSE
    //Now documents are fetched from DB
    res.status(200).json({
        status: 'success',
        results: documents.length,
        data: {
            data: documents
        }
    })


})