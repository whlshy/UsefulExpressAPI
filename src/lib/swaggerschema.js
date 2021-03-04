const fs = require('fs');

// testing Schema auto match
module.exports = (outputFile, schemaFolder) => {
    fs.readdir(schemaFolder, (err, files) => {
        let output = require(outputFile);
        Object.keys(output.paths).map(pathkeys => {
            Object.keys(output.paths[pathkeys]).map(methodkeys => {  // get post put delete...
                if (output.paths[pathkeys][methodkeys].tags.length > 0 && output.paths[pathkeys][methodkeys].parameters) {
                    if (files.filter(f => f.split('.')[0] == output.paths[pathkeys][methodkeys].tags[0]).length > 0) {
                        let filename = files.filter(f => f.split('.')[0] == output.paths[pathkeys][methodkeys].tags[0])[0]
                        let schema = require(schemaFolder + '\\'+ filename)
                        if (output.paths[pathkeys][methodkeys].parameters) {
                            output.paths[pathkeys][methodkeys].parameters.map(value => {
                                if (schema.filter(s => s.attr == value.name)[0]) {
                                    let type = schema.filter(s => s.attr == value.name)[0].type
                                    if (type == 'Int') {
                                        type = 'integer'
                                    }
                                    if (type == 'NVarChar' || type == 'VarChar') {
                                        type = 'string'
                                    }
                                    if (type == 'Bit') {
                                        type = 'boolean'
                                    }
                                    console.log(value)
                                    value.type = type
                                }
                                console.log(output.paths[pathkeys][methodkeys].parameters.filter(f => f.name == value.name))
                                if (value.schema) {
                                    if (value.schema.properties) {
                                        Object.keys(value.schema.properties).map(objvalue => {
                                            console.log(value.schema.properties[objvalue])
                                            if (schema.filter(s => s.attr == objvalue).length > 0) {
                                                if (objtype == 'Int') {
                                                    objtype = 'integer'
                                                }
                                                if (objtype == 'NVarChar' || objtype == 'VarChar') {
                                                    objtype = 'string'
                                                }
                                                if (objtype == 'Bit') {
                                                    objtype = 'boolean'
                                                }
                                                value.schema.properties[objvalue].type = objtype;
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            })
        })
        let dataJSON = JSON.stringify(output, null, 2)
        fs.writeFileSync(outputFile, dataJSON)
        console.log('Swagger-schema: Success')
    });
}