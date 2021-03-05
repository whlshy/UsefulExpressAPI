
const tables = require('./tables')
const statics = require('./statics')

let lang = 'en'
let definitions = {}

function getLanguage() {
    return lang
}

/**
 * TODO: fill
 * @param {*} newLang 
 */
function setLanguage(newLang) {
    lang = newLang
    return lang
}

// Used to reference
function setDefinitions(def) {
    definitions = def
}

// TODO: Refactor
/**
 * TODO: fill
 * @param {*} def 
 * @param {*} resp 
 */
function formatDefinitions(def, resp = {}, constainXML) {
    if (def.$ref) {
        if (def.$ref.split('#/definitions/').length === 1) {
            throw console.error("[Swagger-autogen] Syntax error: ", def.$ref)
        }
        let param = def.$ref.split('#/definitions/')[1].replaceAll(' ', '')
        if (constainXML)
            return { xml: { name: param.toLowerCase() }, $ref: def.$ref }
        else
            return { $ref: def.$ref }
    }
    let arrayOf = null
    if (typeof def === 'string') {
        resp.type = "string"
        resp.example = def
    } else if (typeof def === 'number') {
        resp.type = "number"
        resp.example = def
    } else if (typeof def === 'boolean') {
        resp.type = "boolean"
        resp.example = def
    } else {
        if (Array.isArray(def)) {
            if (def && typeof def[0] !== 'object')
                resp = { type: "array", example: def, items: {} }
            else
                resp = { type: "array", items: {} }
            arrayOf = typeof def[0]
        } else
            resp = { type: "object", properties: {} }
        Object.entries(def).forEach(elem => {
            if (typeof elem[1] === 'object') {  // Array or object
                if (resp.type == 'array') {
                    resp.items = { ...formatDefinitions(elem[1], resp, constainXML) }
                } else {
                    resp.properties[elem[0]] = formatDefinitions(elem[1], resp, constainXML)
                }
            } else {
                if (resp.type == 'array') {
                    if (arrayOf == 'object') {
                        if (!resp.items.properties)
                            resp.items.properties = {}
                        resp.items.properties[elem[0]] = { type: typeof elem[1] }
                    } else
                        resp.items = { type: typeof elem[1] }
                } else {
                    if (elem[0][0] == '$') {  // Required parameter
                        elem[0] = elem[0].slice(1)
                        if (!resp.required)
                            resp.required = []
                        resp.required.push(elem[0])
                    }
                    resp.properties[elem[0]] = { type: typeof elem[1], example: elem[1] }
                }
            }
        })
    }
    return resp
}

/**
 * TODO: fill
 * @param {*} elem 
 * @param {*} autoMode 
 */
function getPath(elem, autoMode) {
    if (!elem)
        return null

    let path = false
    var line = elem
    line = line.trim()

    if (autoMode && !elem.includes(statics.SWAGGER_TAG + '.path')) {
        const quotMark = line[0]
        if ((quotMark == '\"' || quotMark == '\'' || quotMark == '\`') && line.split(quotMark).length > 2) {
            line = line.replaceAll(`\\${quotMark}`, statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER) // avoiding problemas caused by: " ... \" ... ", ' ... \' ... ', etc
            path = line.split(quotMark)[1]
            path = path.replaceAll(statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER, `\\${quotMark}`) // avoiding problemas caused by: " ... \" ... ", ' ... \' ... ', etc
            path = path.split('/').map(p => {
                if (p.includes(':'))
                    p = '{' + p.replace(':', '') + '}'
                return p
            })
            path = path.join('/')
        } else {
            path = "/_undefined_path_0x" + elem.length.toString(16)
        }
    } else if (elem.includes(statics.SWAGGER_TAG + '.path'))  // Search for #swagger.path
        path = elem.split(statics.SWAGGER_TAG + '.path')[1].replaceAll(' ', '').replaceAll('\'', '\"').replaceAll('`', '\"').split('=')[1].getBetweenStrs('\"', '\"')
    else
        path = "/_undefined_path_0x" + elem.length.toString(16)
    return path
}

// Get #swagger.method
function getMethodTag(data) {
    if (data.includes(statics.SWAGGER_TAG + '.method')) {
        let method = data.split(new RegExp(statics.SWAGGER_TAG + ".method" + "\\s*\\=\\s*"))[1]
        method = popString(method)
        if (method && statics.METHODS.includes(method.toLowerCase()))
            return method.toLowerCase()
    }
    return false
}

/**
 * Get #swagger.start and #swagger.end
 * @param {*} aData 
 */
function getForcedEndpoints(aData) {
    let aForcedsEndpoints = aData.split(new RegExp(".*#swagger.start.*|.*#swagger.end.*", "i"))
    if (aForcedsEndpoints.length > 1) {
        aForcedsEndpoints = aForcedsEndpoints.filter((_, idx) => idx % 2 != 0)
        aForcedsEndpoints = aForcedsEndpoints.map((e) => {
            let method = e.split(new RegExp("#swagger\\.method\\s*\\=\\s*"))
            if (method.length > 1) {
                method = method[1].split(/\n|\;/)
                method = method[0].replaceAll('\"', '').replaceAll('\'', '').replaceAll('\`', '').replaceAll(' ', '')
            } else {
                method = 'get'
            }
            return e = "[_[" + method + "]_])('/_undefined_path_0x" + e.length.toString(16) + "', " + e
        })
    } else
        aForcedsEndpoints = []
    return aForcedsEndpoints
}

/**
 * Search for #swagger.ignore
 * @param {*} elem 
 */
function getIgnoreTag(elem) {
    if (elem.includes(statics.SWAGGER_TAG + '.ignore'))
        if (elem.split(statics.SWAGGER_TAG + '.ignore')[1].replaceAll(' ', '').split('=')[1].slice(0, 4) == 'true')
            return true
    return false
}

/**
 * Search for #swagger.auto = false   (by default is true)
 * @param {*} data 
 */
function getAutoTag(data) {
    if (data.includes(statics.SWAGGER_TAG + ".auto")) {
        let auto = data.split(new RegExp(statics.SWAGGER_TAG + ".auto" + "\\s*\\=\\s*"))[1]
        auto = auto.split(new RegExp("\\s|\\n|\\t|\\;"))[0]
        if (auto && auto.toLowerCase() === 'false')
            return false
    }
    return true
}

// pass to separated file
/**
 * TODO: fill
 * @param {*} data 
 * @param {*} startSymbol 
 * @param {*} endSymbol 
 */
function stack0SymbolRecognizer(data, startSymbol, endSymbol) {
    return new Promise((resolve) => {
        var stack = 0
        var rec = 0
        let strVect = []

        for (let idx = 0; idx < data.length; ++idx) {
            let c = data[idx]

            if (rec == 0 && c == startSymbol) rec = 1
            if (c == startSymbol && rec == 1) stack += 1
            if (c == endSymbol && rec == 1) stack -= 1
            if (stack == 0 && rec == 1) rec = 2

            if (rec == 1)
                strVect.push(c)

            if ((idx === data.length - 1 && rec == 1) || (idx === data.length - 1 && rec == 0))
                return resolve(null)

            if (idx === data.length - 1) {
                strVect = strVect.join('')
                return resolve(strVect.slice(1))
            }
        }
    })
}

/**
 * TODO: fill
 * @param {*} data 
 * @param {*} objParameters 
 */
function getParametersTag(data, objParameters) {
    return new Promise(async (resolve) => {
        data = data.replaceAll('\"', '\'').replaceAll('`', '\'').replaceAll('\`', '\'').replaceAll('\n', ' ')
        let swaggerParameters = data.split(new RegExp("#swagger.parameters"))
        swaggerParameters.shift()
        for (let idx = 0; idx < swaggerParameters.length; ++idx) {
            let parameter = await stack0SymbolRecognizer(swaggerParameters[idx], '{', '}')
            let name = swaggerParameters[idx].split(new RegExp("\\[|\\]"))[1].replaceAll('\'', '')

            try {
                objParameters[name] = { name, ...objParameters[name], ...eval(`(${'{' + parameter + '}'})`) }
            } catch (err) {
                console.error('Syntax error: ' + parameter)
                console.error(err)
                return resolve(false)
            }

            if (!objParameters[name].in)   // by default: 'in' is 'query'
                objParameters[name].in = 'query'

            if (!objParameters[name].type && !objParameters[name].schema)   // by default: 'type' is 'string' when 'schema' is missing
                objParameters[name].type = 'string'

            if (objParameters[name].schema && !objParameters[name].schema.$ref)
                objParameters[name].schema = formatDefinitions(objParameters[name].schema)
        }

        return resolve(objParameters)
    })
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getProducesTag(data) {
    return new Promise(async (resolve) => {
        data = data.replaceAll('\n', ' ').replaceAll("__¬¬¬__", "\"")
        let produces = []
        let swaggerProduces = data.split(new RegExp("#swagger.produces\\s*\\=\\s*"))
        swaggerProduces.shift()
        for (let idx = 0; idx < swaggerProduces.length; ++idx) {
            let prod = await stack0SymbolRecognizer(swaggerProduces[idx], '[', ']')
            try {   // Handling syntax error
                if (prod)
                    produces = [...produces, ...eval(`(${'[' + prod.toLowerCase() + ']'})`)]
            } catch (err) {
                console.error('Syntax error: ' + prod)
                console.error(err)
                return resolve(false)
            }
        }

        // avoid duplicates
        let cleanedProduces = new Set()
        cleanedProduces.add(...produces)
        return resolve([...cleanedProduces])
    })
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getConsumesTag(data) {
    return new Promise(async (resolve) => {
        data = data.replaceAll('\n', ' ').replaceAll("__¬¬¬__", "\"")
        let consumes = []
        let swaggerConsumes = data.split(new RegExp("#swagger.consumes\\s*\\=\\s*"))
        swaggerConsumes.shift()
        for (let idx = 0; idx < swaggerConsumes.length; ++idx) {
            let cons = await stack0SymbolRecognizer(swaggerConsumes[idx], '[', ']')

            try {   // Handling syntax error
                if (cons)
                    consumes = [...consumes, ...eval(`(${'[' + cons.toLowerCase() + ']'})`)]
            } catch (err) {
                console.error('Syntax error: ' + cons)
                console.error(err)
                return resolve(false)
            }
        }

        // avoid duplicates
        let cleanedConsumes = new Set()
        cleanedConsumes.add(...consumes)
        return resolve([...cleanedConsumes])
    })
}

/**
 * TODO: fill
 * @param {*} data 
 * @param {*} objResponses 
 */
function getResponsesTag(data, objResponses) {
    return new Promise(async (resolve) => {
        data = data.replaceAll('\n', ' ')
        let swaggerResponses = data.split(new RegExp("#swagger.responses"))
        swaggerResponses.shift()
        for (let idx = 0; idx < swaggerResponses.length; ++idx) {
            let statusCode = swaggerResponses[idx].split(new RegExp("\\[|\\]"))[1].replaceAll('\"', '').replaceAll('\'', '').replaceAll('\`', '')

            if (swaggerResponses[idx].split(new RegExp(`\\[\\s*\\t*\\s*\\t*${statusCode}\\s*\\t*\\s*\\t*\\]\\s*\\t*\\s*\\t*\\=\\s*\\t*\\s*\\t*\\{`)).length > 1) {  // has object
                let objResp = await stack0SymbolRecognizer(swaggerResponses[idx], '{', '}')

                try {   // Handling syntax error
                    objResp = { ...eval(`(${'{' + objResp + '}'})`) }
                } catch (err) {
                    console.error('Syntax error: ' + objResp)
                    console.error(err)
                    return resolve(false)
                }

                if (objResp && objResp.schema && !objResp.schema.$ref) {
                    objResponses[statusCode] = { ...objResponses[statusCode], ...objResp, schema: formatDefinitions(objResp.schema) }
                    if (objResponses[statusCode].xmlName) {
                        objResponses[statusCode].schema['xml'] = { name: objResponses[statusCode].xmlName }
                        delete objResponses[statusCode].xmlName
                    } else
                        objResponses[statusCode].schema['xml'] = { name: 'main' }
                } else
                    objResponses[statusCode] = { ...objResponses[statusCode], ...objResp }
            } else {
                // There isn't any object
                objResponses[statusCode] = {}
            }

            if (!objResponses[statusCode].description)
                objResponses[statusCode].description = tables.getHttpStatusDescription(statusCode, lang)

            if (idx == swaggerResponses.length - 1)
                return resolve(objResponses)
        }
    })
}

/**
 * TODO: fill
 * @param {*} aDataRaw 
 */
function getRouter(aDataRaw) {
    if (!aDataRaw)
        return null

    const regexNewRouter = /=\s*\n*\t*new\s*\n*\t*Router\s*\n*\t*\(\s*\n*\t*{/
    if (aDataRaw.split(new RegExp(`(const|var|let)\\s*\\n*\\t*\\w*\\s*\\n*\\t*\\=\\s*\\n*\\t*.*Router\\s*\\n*\\t*\\([\\s\\S]*\\)`, "i")).length > 1) {
        var varRoute = elem.split(' ')[1].split('=')[0].replaceAll(' ', '')
        return varRoute
    }

    if (aDataRaw.includes(statics.SWAGGER_TAG + '.router')) { // Search for #swagger.router
        return aDataRaw.split(statics.SWAGGER_TAG + '.router')[1].replaceAll(' ', '').replaceAll('\'', '\"').replaceAll('`', '\"').split('=')[1].getBetweenStrs('\"', '\"')
    }
    return null
}

/**
 * TODO: fill
 * @param {*} data 
 */
function popString(data) {
    let dataAux = data.split('')
    for (let idx = 0; idx < dataAux.length; ++idx) {
        if (dataAux[idx] == '\"' || dataAux[idx] == '\'' || dataAux[idx] == '\`') {
            data = data.slice(idx)
            break
        }

    }
    const quotMark = data[0]
    if ((quotMark == '\"' || quotMark == '\'' || quotMark == '\`') && data.split(quotMark).length > 2) {
        let aux = data.replaceAll(`\\${quotMark}`, statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER)
        aux = aux.split(quotMark)
        data = aux[1]
        data = data.replaceAll(statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER, `\\${quotMark}`)
        if (data === '')
            return null
        return data
    }
    return null
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getDescription(data) {
    let swaggerDescription = data.split(new RegExp("#swagger.description\\s*\\=\\s*"))[1]
    const quotMark = swaggerDescription[0]
    if ((quotMark == '\"' || quotMark == '\'' || quotMark == '\`') && swaggerDescription.split(quotMark).length > 2) {
        let aux = swaggerDescription.replaceAll(`\\${quotMark}`, statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER)
        aux = aux.split(quotMark)
        swaggerDescription = aux[1]
        swaggerDescription = swaggerDescription.replaceAll(statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER, `\\${quotMark}`)
        return swaggerDescription
    }
    return ""
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getSummary(data) {
    let swaggerSummary = data.split(new RegExp("#swagger.summary\\s*\\=\\s*"))[1]
    const quotMark = swaggerSummary[0]
    if ((quotMark == '\"' || quotMark == '\'' || quotMark == '\`') && swaggerSummary.split(quotMark).length > 2) {
        let aux = swaggerSummary.replaceAll(`\\${quotMark}`, statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER)
        aux = aux.split(quotMark)
        swaggerSummary = aux[1]
        swaggerSummary = swaggerSummary.replaceAll(statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER, `\\${quotMark}`)
        return swaggerSummary
    }
    return ""
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getOperationId(data) {
    let swaggerOperationId = data.split(new RegExp("#swagger.operationId\\s*\\=\\s*"))[1]
    const quotMark = swaggerOperationId[0]
    if ((quotMark == '\"' || quotMark == '\'' || quotMark == '\`') && swaggerOperationId.split(quotMark).length > 2) {
        let aux = swaggerOperationId.replaceAll(`\\${quotMark}`, statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER)
        aux = aux.split(quotMark)
        swaggerOperationId = aux[1]
        swaggerOperationId = swaggerOperationId.replaceAll(statics.STRING_BREAKER + "quotMark" + statics.STRING_BREAKER, `\\${quotMark}`)
        return swaggerOperationId
    }
    return ""
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getTags(data) {
    let tags = []
    let swaggerTags = data.split(new RegExp("#swagger.tags\\s*\\=\\s*"))[1]
    const symbol = swaggerTags[0]
    if (symbol == '[' && swaggerTags.split(new RegExp("\\[|\\]")).length > 2) {
        let aux = swaggerTags.split(new RegExp("\\[|\\]"))
        swaggerTags = aux[1]
        for (let idx = 0; idx < 15; ++idx) {  // max limit of tags = 15
            let str = popString(swaggerTags)
            if (!str)
                break

            swaggerTags = swaggerTags.replace(str, '').replaceAll("\"\"", "").replaceAll("\'\'", "").replaceAll("\`\`", "")
            tags.push(str)
        }
        return tags
    }
    return []
}

/**
 * TODO: fill
 * @param {*} data 
 */
function getSecurityTag(data) {
    return new Promise(async (resolve) => {
        let security = []
        let swaggerSecurity = data.split(new RegExp("#swagger.security\\s*\\=\\s*"))[1]
        let securityParameters = await stack0SymbolRecognizer(swaggerSecurity, '[', ']')
        try {   // Handling syntax error
            security = eval(`(${'[' + securityParameters + ']'})`)
        } catch (err) {
            console.error('Syntax error: ' + securityParameters)
            console.error(err)
            return resolve(false)
        }
        return resolve(security)
    })
}


module.exports = {
    formatDefinitions,
    getLanguage,
    setLanguage,
    getPath,
    getMethodTag,
    getForcedEndpoints,
    getIgnoreTag,
    getAutoTag,
    getParametersTag,
    getProducesTag,
    getConsumesTag,
    getResponsesTag,
    setDefinitions,
    getRouter,
    getDescription,
    getTags,
    getSecurityTag,
    getSummary,
    getOperationId
}