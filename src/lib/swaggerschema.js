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
                        let schema = require(schemaFolder + '\\' + filename)
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
                                    value.type = type
                                }
                                if (value.schema) {
                                    if (value.schema.properties) {
                                        Object.keys(value.schema.properties).map(objvalue => {
                                            if (schema.filter(s => s.attr == objvalue).length > 0) {
                                                let objtype = schema.filter(s => s.attr == objvalue)[0].type
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
                                                delete value.schema.properties[objvalue]['example']
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