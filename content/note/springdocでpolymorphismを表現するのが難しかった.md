---
title: springdocでpolymorphismを表現するのが難しかった
date: 2021-01-18T20:19:00+09:00
lastmod: 2021-05-30T18:46:32+09:00
tags:
- spring
---

# springdoc-bug

nestしたpolymorphismがうまく反映されなかった

````kotlin
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
        val name: String,
        val coord: CoordinateRecord,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val departureTime: LocalDateTime? = null,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val arrivalTime: LocalDateTime? = null,
        val isFirstSpot: Boolean = false,
        val isLastSpot: Boolean = false,
    ) : SectionRecord()

    data class Move(
        val move: MoveTypeRecord,
        val distanceMeter: Int,
        val transitMinutes: Int,
        val transitFare: Int,
        @Schema(description = "駅等の入口名称等", example = "A3口")
        val entranceGateway: String? = null,
        @Schema(description = "駅等の出口名称", example = "6番口(赤レンガ倉庫口)")
        val exitGateway: String? = null,
        val transport: TransportRecord?,
        val directOperations: List<DirectOperationRecord> = listOf(),
    ) : SectionRecord()
}

@Schema(description = "直通区間の情報")
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes(
    value = [
        JsonSubTypes.Type(value = DirectOperationRecord.Point::class, name = "point"),
        JsonSubTypes.Type(value = DirectOperationRecord.Move::class, name = "move"),
    ]
)
sealed class DirectOperationRecord() {
    data class Point(
        val name: String,
        val coord: CoordinateRecord,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val departureTime: LocalDateTime? = null,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val arrivalTime: LocalDateTime? = null,
    ) : DirectOperationRecord()

    data class Move(
        val move: MoveTypeRecord,
        val distanceMeter: Int,
        val transitMinutes: Int,
        val transitFare: Int,
        val transport: TransportRecord?,
    ) : DirectOperationRecord()
}

````

やっぱり書き方が正しくないっぽい…

````kotlin
@Schema(
    description = "ルート詳細の1区間情報",
    oneOf = [SectionRecord.SectionPoint::class, SectionRecord.SectionMove::class],
    discriminatorProperty = "type",
    discriminatorMapping = [
        DiscriminatorMapping(value = "point", schema = SectionRecord.SectionPoint::class),
        DiscriminatorMapping(value = "move", schema = SectionRecord.SectionMove::class),
    ],
)
sealed class SectionRecord(val type: String) {
    data class SectionPoint(
        val name: String,
        val coord: CoordinateRecord,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val departureTime: LocalDateTime? = null,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val arrivalTime: LocalDateTime? = null,
        val isFirstSpot: Boolean = false,
        val isLastSpot: Boolean = false,
    ) : SectionRecord("point")

    data class SectionMove(
        val move: MoveTypeRecord,
        val distanceMeter: Int,
        val transitMinutes: Int,
        val transitFare: Int,
        @Schema(description = "駅等の入口名称等", example = "A3口")
        val entranceGateway: String? = null,
        @Schema(description = "駅等の出口名称", example = "6番口(赤レンガ倉庫口)")
        val exitGateway: String? = null,
        val transport: TransportRecord?,
        val directOperations: List<DirectOperationRecord> = listOf(),
    ) : SectionRecord("move")
}

@Schema(
    description = "ルート詳細の1区間情報",
    oneOf = [DirectOperationRecord.DirectOperationPoint::class, DirectOperationRecord.DirectOperationMove::class],
    discriminatorProperty = "type",
    discriminatorMapping = [
        DiscriminatorMapping(value = "point", schema = DirectOperationRecord.DirectOperationPoint::class),
        DiscriminatorMapping(value = "move", schema = DirectOperationRecord.DirectOperationMove::class),
    ],
)
sealed class DirectOperationRecord(val type: String) {
    data class DirectOperationPoint(
        val name: String,
        val coord: CoordinateRecord,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val departureTime: LocalDateTime? = null,
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        val arrivalTime: LocalDateTime? = null,
    ) : DirectOperationRecord("point")

    data class DirectOperationMove(
        val move: MoveTypeRecord,
        val distanceMeter: Int,
        val transitMinutes: Int,
        val transitFare: Int,
        val transport: TransportRecord?,
    ) : DirectOperationRecord("move")
}
````

これだとうまくいったので、JsonSubTypesで反映させるのは正しいやり方ではなかったみたい
