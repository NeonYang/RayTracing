/**
 * Created by NeonYoung on 14-2-20.
 */
function GeoSegment(texturePath){
    this.Buffer=null;
    this.IndexBuffer=null;
    this.BoundingBox=null;//[Pmax,Pmax1,Pmax2,Pmax3,Pmin,Pmin1,Pmin2,Pmin3];
    this.Material=MaterialSet.Default;
    //this.Parameters=new Array();
    this.Vertices=new Float32Array(0);
    this.Indices=new Uint8Array(0);
    this.LocalTransform=new Matrix4();
    this.Parent=null;
    this.Transform=new Matrix4();
    this.Transform.set(this.LocalTransform);
    this.IMG=new Image();  // Create the image object
   // this.IMG.crossOrigin = '';//����Ҫ����ΪͼƬ�ǿ����õģ�����һ��Ҫ���ϴ˾����
    this.IMG.src =texturePath;// 'excavator.jpg';'defaultN.jpg'

    //return (this.Parent==null?this.LocalTransform:this.LocalTransform.multiply(this.Parent.GetMvpMatrix()));
}//GeoObject