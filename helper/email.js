exports.verify = async (name, link) => {
  try {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
          *{
            margin: 0px;
            padding: 0px;
          }
        </style>
      </head>
      <body>
        <h4>Hello ${name}</h3>
        <p>Please kindly <a href="${link}">click here</a> to verify your email</p>
        <p>Thank you</p>
      </body>
      </html>
    `
  } catch (error) {
    throw new Error("Error creating email template");

  }
};


exports.reset = async (name, link) => {
  try {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
          *{
            margin: 0px;
            padding: 0px;
          }
        </style>
      </head>
      <body>
        <h4>Hello ${name}</h3>
        <p>You requested to reset your password. <a href="${link}">Click here</a> to reset</p>
        <p>Ignore if you didn't make any request.</p>
        <p>Thank you</p>
      </body>
      </html>
    `
  } catch (error) {
    throw new Error("Error creating email template");

  }
};