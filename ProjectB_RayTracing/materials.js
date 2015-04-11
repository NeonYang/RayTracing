/**
 * Created by NeonYoung on 3/10/14.
 */
var MaterialSet={
    Default:[new Vector3([0,0,0]),new Vector3([1,1,1]),new Vector3([0,0,0]),15,1,0,0,0],//emissive,diffuse,speclar,shiness,SolidColorRate,ReflectionRate,transmissionRate,Refractive Index
    rubber:[new Vector3([0,0,0]),new Vector3([0.8,0.8,0.8]),new Vector3([0.02,0.02,0.02]),1,1,0,0,0],
    mirror:[new Vector3([0,0,0]),new Vector3([1,1,1]),new Vector3([0.8,0.8,0.8]),10,0,1,0,0],//////////////////////////////Reflection
    water:[new Vector3([0,0,0]),new Vector3([0.9,0.9,1]),new Vector3([0.8,0.8,0.8]),10,0.2,0.25,0.75,1.33],//////////////////////////////Translucent
    crystal:[new Vector3([0,0,0]),new Vector3([1,1,1]),new Vector3([0.8,0.8,0.8]),10,0.1,0,1,1.5],//////////////////////////////[0-7]Translucent
    metal:[new Vector3([0,0,0]),new Vector3([1,1,1]),new Vector3([0.5,0.5,0.5]),89,1,0.3,0,0],//reflection
    Axis:[new Vector3([1,0,0]),new Vector3([0,0,0]),new Vector3([0,0,0]),1,1,0,0,0],
    Emis:[new Vector3([1,1,1]),new Vector3([0,0,0]),new Vector3([0,0,0]),0,1,0,0,0]
}
