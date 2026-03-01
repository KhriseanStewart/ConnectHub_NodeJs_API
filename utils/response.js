export const successResponse = (res, options = {}) => {
    const {
      statusCode = 200,
      message = "Success",
      data = null,
    } = options;
  
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };
  
  export const errorResponse = (res, options = {}) => {
    const {
      statusCode = 500,
      message = "Something went wrong",
      error = null,
    } = options;
  
    return res.status(statusCode).json({
      success: false,
      message,
      error,
    });
  };