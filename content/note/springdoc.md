---
title: springdoc
date: "2020-12-29T16:26:00+09:00"
tags:
  - spring
lastmod: '2021-05-30T18:45:08+09:00'

---

# springdoc

[[SpringFramework]] でOpenAPI仕様書を作成するライブラリ

springfoxをやめた
OAS3にイマイチたいおうしてない

oneOfが使えなかった
<https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/>

やったこと

ライブラリ入れた
OpenAPI()に変更した
annotationをv3に変更した

<https://www.b1a9idps.com/posts/springdoc-openapi-1>
<https://qiita.com/yukithm/items/fafc54bc331696b0c333>
<https://springdoc.org/#migrating-from-springfox>
<https://github.com/springdoc/springdoc-openapi>

### oneOfで警告がでる

<https://github.com/OpenAPITools/openapi-generator/blob/master/modules/openapi-generator/src/main/java/org/openapitools/codegen/DefaultCodegen.java#L2319>

before

    @Schema(
        description = "1区間情報",
        oneOf = [Section.SectionPoint::class, Section.SectionMove::class],
        discriminatorProperty = "sectionType",
    )
    sealed class Section(val sectionType: string) {
        data class SectionPoint(val name: String): Section("point"){}
        data class SectionMove(val move: String): Section("move"){}
    }

after

    @Schema(
        description = "1区間情報",
        oneOf = [Section.SectionPoint::class, Section.SectionMove::class],
        discriminatorProperty = "sectionType",
        discriminatorMapping = [
            DiscriminatorMapping(value = "point", schema = Section.SectionPoint::class),
            DiscriminatorMapping(value = "move", schema = Section.SectionMove::class),
        ],
    )
    sealed class Section() {
        data class SectionPoint(val sectionType: string, val name: String): Section(){}
        data class SectionMove(val sectionType: string, val move: String): Section(){}
    }

### Jacksonでdeserializeするための設定

JsonTypeInfo, JsonSubTypesのアノテーションを追加した

    @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
    @JsonSubTypes(
        value = [
            JsonSubTypes.Type(value = SectionRecord.Point::class, name = "point"),
            JsonSubTypes.Type(value = SectionRecord.Move::class, name = "move"),
        ]
    )

## openapi-generatorでStackOverflowErrorとなる

上記のJsonTypeInfoを入れたら、swagger.yamlからコード生成するときに無限ループとなった

    [main] INFO  o.o.codegen.DefaultGenerator - Generator 'typescript-axios' is considered stable.
    Exception in thread "main" java.lang.StackOverflowError
    	at java.util.regex.Pattern.error(Pattern.java:1969)
    	at java.util.regex.Pattern.<init>(Pattern.java:1354)
    	at java.util.regex.Pattern.compile(Pattern.java:1054)
    	at java.lang.String.replace(String.java:2239)
    	at org.openapitools.codegen.utils.ModelUtils.getSimpleRef(ModelUtils.java:405)
    	at org.openapitools.codegen.utils.ModelUtils.getReferencedSchema(ModelUtils.java:832)
    	at org.openapitools.codegen.DefaultCodegen.addProperties(DefaultCodegen.java:3024)
    	at org.openapitools.codegen.DefaultCodegen.addProperties(DefaultCodegen.java:3000)
    	at org.openapitools.codegen.DefaultCodegen.addProperties(DefaultCodegen.java:3025)
    	at org.openapitools.codegen.DefaultCodegen.addProperties(DefaultCodegen.java:3010)
    	at org.openapitools.codegen.DefaultCodegen.addProperties(DefaultCodegen.java:3025)

swagger.yaml

```yaml
    SectionRecord:
      required:
      - type
      type: object
      properties:
        type:
          type: string
      description: ルート詳細の1区間情報
      discriminator:
        propertyName: type
        mapping:
          point: '#/components/schemas/Point'
          move: '#/components/schemas/Move'
      oneOf:
      - $ref: '#/components/schemas/Point'
      - $ref: '#/components/schemas/Move'
    Move:
      required:
      - distanceMetre
      - move
      - transitFare
      - transitMinutes
      type: object
      allOf:
      - $ref: '#/components/schemas/SectionRecord'
      - type: object
        properties:
          move:
            type: string
            enum:
            - TRAIN
            - EXPRESS_TRAIN
            - BULLET_TRAIN
            - LOCAL_BUS
            - HIGHWAY_BUS
            - FERRY
            - AIRPLANE
            - CYCLE_SHARING
            - CYCLE
            - TAXI
            - CAR
            - CAR_SHARING
            - RENTAL_CAR
            - WALK
          distanceMetre:
            type: integer
            format: int32
          transitMinutes:
            type: integer
            format: int32
          transitFare:
            type: integer
            format: int32
          transport:
            $ref: '#/components/schemas/TransportRecord'
    Point:
      required:
      - coord
      - isFirstSpot
      - isLastSpot
      - name
      type: object
      allOf:
      - $ref: '#/components/schemas/SectionRecord'
      - type: object
        properties:
          name:
            type: string
          coord:
            $ref: '#/components/schemas/CoordinateRecord'
          departureTime:
            type: string
            format: date-time
          arrivalTime:
            type: string
            format: date-time
          isFirstSpot:
            type: boolean
          isLastSpot:
            type: boolean

```

親のoneOfと子のallOfで循環参照しているのが原因ぽい
ためしに子のallOfを消したら通った。

### やったこと

SchemaのoneOfの定義を削除した

```
@Schema(description = "ルート詳細の1区間情報")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(
    value = [
        JsonSubTypes.Type(value = SectionRecord.Point::class, name = "point"),
        JsonSubTypes.Type(value = SectionRecord.Move::class, name = "move"),
    ]
)
sealed class SectionRecord() {
    data class Point(

```

swagger.yaml

```yaml
    SectionRecord:
      required:
      - type
      type: object
      properties:
        type:
          type: string
      description: ルート詳細の1区間情報
      discriminator:
        propertyName: type
    Move:
      required:
      - distanceMetre
      - move
      - transitFare
      - transitMinutes
      type: object
      allOf:
      - $ref: '#/components/schemas/SectionRecord'
      - type: object
        properties:
          move:
            type: string
            enum:
            - TRAIN
            - EXPRESS_TRAIN
            - BULLET_TRAIN
            - LOCAL_BUS
            - HIGHWAY_BUS
            - FERRY
            - AIRPLANE
            - CYCLE_SHARING
            - CYCLE
            - TAXI
            - CAR
            - CAR_SHARING
            - RENTAL_CAR
            - WALK
          distanceMetre:
            type: integer
            format: int32
          transitMinutes:
            type: integer
            format: int32
          transitFare:
            type: integer
            format: int32
          transport:
            $ref: '#/components/schemas/TransportRecord'
    Point:
      required:
      - coord
      - isFirstSpot
      - isLastSpot
      - name
      type: object
      allOf:
      - $ref: '#/components/schemas/SectionRecord'
      - type: object
        properties:
          name:
            type: string
          coord:
            $ref: '#/components/schemas/CoordinateRecord'
          departureTime:
            type: string
            format: date-time
          arrivalTime:
            type: string
            format: date-time
          isFirstSpot:
            type: boolean
          isLastSpot:
            type: boolean

```

```diff
<         mapping:
<           point: '#/components/schemas/Point'
<           move: '#/components/schemas/Move'
<       oneOf:
<       - $ref: '#/components/schemas/Point'
<       - $ref: '#/components/schemas/Move'
```

oneOfの定義が消えた

生成されたコードも問題なし

    export interface SectionRecord {
      /**
       *
       * @type {string}
       * @memberof SectionRecord
       */
      type: string
    }
    export interface Move extends SectionRecord {
    	// ....
    }
    export interface Point extends SectionRecord {
    	// ....
    }
