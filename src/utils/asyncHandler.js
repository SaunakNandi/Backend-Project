// Making a wrapper function which accepts a function and then process it and return the output

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asyncHandler };

// using try catch
// higher order function
// const asyncHandler=(fn)=> async(req,res,next)=>{
//     try {SW
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 5000).json({
//             success:false,
//             message:err.message
//         })
//     }
// }
