import swaggerJsdoc from 'swagger-jsdoc';

const options={
    definition:{
        openapi:'3.0.0',
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
        components:{
            securitySchemes:{
                bearerAuth:{
                    type:'http',
                    schema:'bearer',
                    bearerFormat:'JWT', 
                },
            },
        },
    },
    apis:["./routes/*.js"], 
};

export const specs=swaggerJsdoc(options);