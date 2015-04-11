/**
 * Created by NeonYoung on 14-2-20.
 */

function Camera(type){
    var projMatrix =new Matrix4();
    this.Transform =new Matrix4();//this is actually camera matrix
    this.Target=null;///Whether this is necessary...???// probably can be optimized
    var TypeChangeRatio=40;//a ratio between PersFov and OrthClipPlanes
    this.type=type;
    this.aspectT=canvas.height/canvas.width;
    this.fovT=40;//equivalent to f focal length
    if(this.type=="Orth")
    {
        var leftP=-this.aspectT*this.fovT/TypeChangeRatio;//!!!how can it find this variable!???
        var rightP=this.aspectT*this.fovT/TypeChangeRatio;
        var bottomP=-this.fovT/TypeChangeRatio;
        var topP=this.fovT/TypeChangeRatio;
        this.near=0;
        this.far=150;
        projMatrix.setOrtho( leftP, rightP, bottomP, topP, this.near, this.far);
        this.setOrth=function (left,right,bottom,top,nearClip,farClip)
        {
            leftP=left;
            rightP=right;
            bottomP=bottom;
            topP=top;
            near=nearClip;
            far=farClip;
            projMatrix.setOrtho(leftP,rightP,bottomP,topP,near,far);
        }
    }
    else if(this.type=="Pers")
    {

       // this.aspectT=canvas.width/canvas.height;//--------------------------------------->>>
        this.near=0.01;
        this.far=500;
        projMatrix.setPerspective( this.fovT, this.aspectT, this.near, this.far);
        this.setPers = function (fov,aspect,nearClip,farClip){
            this.fovT=fov;
            this.aspectT=aspect;
            this.near=nearClip;
            this.far=farClip;
            projMatrix.setPerspective(fovT,aspectT,near,far);
        }
    }
    //this.Transform=new Matrix4();//.setLookAt(1, 1,1,    0, 0, 0.5,       0, 1, 0);//initialize Transform

    this.GetMvpMatrix = function(){

        var TempMt=new Matrix4();
        this.aspectT=1;//2*canvas.height/canvas.width; /////////////updated while rendering
        if(this.type=="Orth")
        {
            projMatrix.setOrtho( -this.aspectT*this.fovT/TypeChangeRatio,this.aspectT*this.fovT/TypeChangeRatio, -this.fovT/TypeChangeRatio,this.fovT/TypeChangeRatio, this.near, this.far);
        }
        else if(this.type=="Pers")
        {
            projMatrix.setPerspective( this.fovT, this.aspectT, (this.near<0.01?0.01:this.near), this.far);
        }
        var ViewM=new Matrix4();
        var Parent=new Matrix4()
        if(this.Parent!=null)
                Parent.set(this.Parent.Transform);
        ViewM. setInverseOf(Parent.multiply(this.Transform));//view matrix is the inverse of camera matrix
       /* if(this.Parent!=null)
        {
            var Inv=new Matrix4();
            Inv. setInverseOf(this.Parent.Transform);
            TempMt.set(projMatrix).multiply(this.Transform).multiply(Inv);
        }else{*/
           TempMt.set(projMatrix).multiply(ViewM);

        //}
        return TempMt;
    }
    this.GetWTranslation=function(){
        var PMatrix=this.parent==null?new Matrix4():new Matrix4().set(this.parent);
        PMatrix.multiply(this.Transform)
        var WTranslation=new Vector3([PMatrix.elements[12],PMatrix.elements[13],PMatrix.elements[14]]);
        return WTranslation;
    }

    this.Parent=null;
}