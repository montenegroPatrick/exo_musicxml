const syncPoints = [
    { type: 'start', time: 0, location: { measureIdx: 0 } },
    { type: 'end', time: 80 }
];
const nbMeasures = 66;

const points = [];
let endTime = syncPoints[syncPoints.length - 1].time;

for (let i = 0; i < syncPoints.length - 1; i++) {
    const syncPoint = syncPoints[i];
    const nextSyncPoint = syncPoints[i + 1];
    const currentStart = syncPoint.time;
    
    let nbMeasureToInsert = 0;
    let timeOfMeasure = 0;
    
    if ((!nextSyncPoint || nextSyncPoint.type === 'end') && syncPoint.type !== 'end') {
        nbMeasureToInsert = nbMeasures - (syncPoint.location?.measureIdx ?? 0);
        if (nbMeasureToInsert > 0) timeOfMeasure = (endTime - syncPoint.time) / nbMeasureToInsert;
    } else {
        nbMeasureToInsert = (nextSyncPoint.location?.measureIdx ?? 0) - (syncPoint.location?.measureIdx ?? 0);
        if (nbMeasureToInsert > 0) timeOfMeasure = (nextSyncPoint.time - syncPoint.time) / nbMeasureToInsert;
    }
    
    for (let idx = 0; idx < nbMeasureToInsert; idx++) {
        points.push(currentStart + (timeOfMeasure * idx));
    }
}
console.log("Generated points:", points.length);
