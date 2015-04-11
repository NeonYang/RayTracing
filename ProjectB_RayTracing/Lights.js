/**
 * Created by NeonYoung on 3/10/14.
 */
function Light(){
    this.position=new Vector3([0, 0, 0]);
    this.color=new Vector3([1, 1, 1]);
    this.ambient=new Vector3([0, 0, 0]);
    this.intensity=1;
    this.parent=null;
    this.type=1;
    this.direction=new Vector4([0,-1,0,0]);
}