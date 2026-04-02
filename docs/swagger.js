const options={
    definition:{
        openapi:'3.0.0', // what is the ?
        info:{
            title:"SwiftQueue API",
            version:'1.0.0', 
            description:"API documentation for SwiftQueue, the restaurant queue management system."
        },
        servers:[
            {
                url:"http://localhost:3000",
                description:"Development server",
            },
        ],
        // why i am using these [] ?
        components:{
            securitySchemes:{ // what is these? and what is bearer ? 
                bearerAuth:{
                    type:'http',
                    schema:'bearer',
                    bearerFormat:'JWT', // theres any other format ?
                },
            },
        },
    },
    apis:["./routes/*.js"], // where is this file and what is it for ? and what do we mean by annotations?
};

export const specs=swaggerJsdoc(options); // what is swaggerJsdoc and why we use it ?