---
title: typescript-openapi
date: "2020-12-29T16:35:00+09:00"
tags:
  - TypeScript
  - OpenAPI
lastmod: '2021-05-30T18:45:19+09:00'

---

# typescript openapi

<https://github.com/OpenAPITools/openapi-generator/blob/master/docs/generators/typescript-axios.md>

package.json

```json
{
    "scripts": {
        "openapi-generate": "rm -f api_client/*.ts && TS_POST_PROCESS_FILE='yarn prettier --write' openapi-generator-cli generate -i http://localhost:8080/api/v3/api-docs -g typescript-axios -o api_client --additional-properties=disallowAdditionalPropertiesIfNotPresent=false,modelPropertyNaming=camelCase,supportsES6=true,useSingleRequestParameter=true --enable-post-process-file"
    }
}
```
