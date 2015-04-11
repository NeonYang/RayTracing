/**
 * Created by NeonYoung on 5/23/14.
 */
//define class Ray
var Ray=function(Ori,Dir)
{
    if(Ori&&Dir)
    {
    this.Ori=Ori;
    this.Dir=Dir;
    }else
    {
        this.Ori=new Vector4([0,0,0,1]);
        this.Dir=new Vector4([0,0,-1,0]);
    }
}
//define class Hit
var Hit=function()
{
    this.HitPosition=null;
    this.HitObj=null;
    this.HitFaceInfo=null;
    this.HitNormal=new Vector3([0,1,0]);
    this.HitTextureCoord=new Vector3([0,0,1]);
}



function DoRayTracing(myImg,Cam,Lights,Objects,width,height,subpixel,antialias,curX,curY)
{
    var xsiz = width;
    var ysiz = height;
    var f=1/Math.tan(Cam.fovT*Math.PI/2/180);
    //myImg = new Uint8Array(xsiz*ysiz*3);	// r,g,b; r,g,b; r,g,b pixels
    //prepare inverse matrix and inverseTranspose matrix for further usage
    //works properly after initialization (when all objects are rendered) so that Transform matrix of all the objects are calculated
    for(model_i=0;model_i<Objects.length;model_i++)
    {
        if(Objects[model_i].inverseTransform) continue;
        var InvT=new Matrix4();
        var InvTT=new Matrix4();
        InvT.setInverseOf(Objects[model_i].Transform);
        InvTT.set(InvT);
        Objects[model_i].inverseTransform=InvT;
        Objects[model_i].inverseTransposeTransform=InvTT.transpose();
    }
    /////
    for(var j=curY; j< curY+32; j++) {					// for the j-th row of pixels j-y coord
        for(var i=curX; i< curX+32; i++) {				// and the i-th pixel on that row, i-column-x coord
         //   for(var j=CurY; j< CurY+32; j++) {					// for the j-th row of pixels j-y coord
          //      for(var i=CurX; i< CurX+32; i++) {
                    var idx = (j*xsiz + i)*3;					// pixel (i,j) array index (red)
            // lower left corner (0,0)  upper right (xsiz,ysiz)
           var _Ray=GetRay(Cam,2*i/xsiz-1,2*j/ysiz-1,f);//Cam1,Ray relative to World coord Ori+Dir
            var _Hit=GetNearestHit(_Ray,Objects);// if not hit, it will return null
            /*if(!_Hit)
                console.log("HoHit");*/
            var color=GetColorAtPosition(Cam,Objects,Lights,_Ray,_Hit,0,5);
            myImg[idx   ] =color.elements[0];
            myImg[idx +1] = color.elements[1];
            myImg[idx +2] = color.elements[2];						// 0 <= blu <= 255
/*            myImg[idx   ] = i*256/xsiz;/*//*Math.random();								// 0 <= red <= 255
            myImg[idx +1] = j*256/ysiz;;/*//*Math.random();								// 0 <= grn <= 255
            myImg[idx +2] = 0;								// 0 <= blu <= 255*/


        }
    }


//////for animation only///////////////
    CurX=(curX+32)%xsiz;
    CurY=curY+32*(Math.floor((curX+32)/xsiz));
    if(CurY==ysiz)
    {
        CurX=-1;
        CurY=-1;
        Render=false;
        alert("Done!");
    }

    return myImg;
}

function GetRay(Cam,canonX,canonY,canonf)
{
    var _Ray=new Ray();
    _Ray.Ori=new Vector4([Cam.Transform.elements[12],Cam.Transform.elements[13],Cam.Transform.elements[14],1]);
    _Ray.Dir=Cam.Transform.multiplyVector4(new Vector4([canonX,canonY,-canonf,0]))//get x y f in pixel coord

    //transform into world coordinate
    return _Ray;//
}
function GetNearestHit(_Ray,ObjList,Relc)
{
    var _Hit=new Hit();//coord,hit obj(mat,texture) normal
    var Finfo=null;
    if(Relc)
     console.log("Calculating hit in reflection");
    for(ObjIndex=0;ObjIndex<ObjList.length;ObjIndex++)
    {
        var curObj=ObjList[ObjIndex];
        //Transform Ray into Model Coordinate
        var RayLocal=new Ray(curObj.inverseTransform.multiplyVector4(_Ray.Ori),curObj.inverseTransform.multiplyVector4(_Ray.Dir));
        //check bounding box collision first
        //if collide with bounding box, do further check
        if(CheckBoundingBoxCollision(RayLocal,ObjList[ObjIndex].BoundingBox))//
        {
            //get collision point
            var minDis=Infinity;
            var NearestPoint=null;
            var NearestFaceIndex=-1;
            for(faceI=0;faceI<curObj.Indices.length;faceI=faceI+3)
            {
                var P1=new Vector3([curObj.Vertices[curObj.Indices[faceI]*8],curObj.Vertices[curObj.Indices[faceI]*8+1],curObj.Vertices[curObj.Indices[faceI]*8+2]]);
                var P2=new Vector3([curObj.Vertices[curObj.Indices[faceI+1]*8],curObj.Vertices[curObj.Indices[faceI+1]*8+1],curObj.Vertices[curObj.Indices[faceI+1]*8+2]]);
                var P3=new Vector3([curObj.Vertices[curObj.Indices[faceI+2]*8],curObj.Vertices[curObj.Indices[faceI+2]*8+1],curObj.Vertices[curObj.Indices[faceI+2]*8+2]]);

                var Intsc=GetCollisionPointWithinArea(RayLocal,P1,P2,P3,"Triangle")
                if(!Intsc)continue;//ray has no collision with current facet, no need to update
                var NNear= new Vector3(RayLocal.Ori.elements).distanceSqr(Intsc);
                if(NNear<minDis)
                {
                    NearestFaceIndex=faceI;
                    minDis=NNear;
                    NearestPoint=Intsc;//relative to Model Matrix
                }
            }
            //transform Intsc to world coord
            //GetDistance()
            //if < Update Hit point, face index
            if(!NearestPoint)continue;//ray has no collision with current object, no need to update (collide with bounding box doesn't necessarily mean collide with object
            NearestPoint=curObj.Transform.multiplyVector3(NearestPoint);
            if(!_Hit.HitPosition||NearestPoint.distanceSqr(_Ray.Ori)<_Hit.HitPosition.distanceSqr(_Ray.Ori))
            {
                _Hit.HitPosition=NearestPoint;//relative to world coordinate
                _Hit.HitObj=curObj;
                Finfo=NearestFaceIndex;
            }
        }
     }

    //get normal, texture coord  of intersection point
    //position and normal are in model space
    if(!_Hit.HitPosition||!_Hit.HitObj) return null;

    if(Finfo==undefined||Finfo<0||Finfo>_Hit.HitObj.Indices.length)
        console.log("Exception");
    _Hit.HitFaceInfo=[new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8],
                                     _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+1],
                                     _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+2]
                                 ]),//Position
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+3],
                                     _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+4],0
                                ]),//Texture coord
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+5],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+6],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo]*8+7]
                               ]),//Normal Vector
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+1],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+2]
    ]),
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+3],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+4],0
    ]),
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+5],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+6],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+1]*8+7]
    ]),
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+1],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+2]
    ]),
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+3],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+4],0
    ]),
                        new Vector3([_Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+5],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+6],
                            _Hit.HitObj.Vertices[_Hit.HitObj.Indices[Finfo+2]*8+7]
    ])];
    //binlinear interpolation
    //get m n factor first
    var HitPositionInModel=_Hit.HitObj.inverseTransform.multiplyVector3(_Hit.HitPosition);
    var P3P1n=_Hit.HitFaceInfo[0].subtractVector(_Hit.HitFaceInfo[6]).normalize();
    var P1P=HitPositionInModel.subtractVector(_Hit.HitFaceInfo[0]);
    var P2P=HitPositionInModel.subtractVector(_Hit.HitFaceInfo[3]);
    var P2Pn=P2P.normalize();
    var P3P=HitPositionInModel.subtractVector(_Hit.HitFaceInfo[6]);
    var A1=P3P.subtractVector(P3P1n.multiplyValue(P3P1n.dotProduct(P3P)));
    var A2=P2P.subtractVector(P3P1n.multiplyValue(P3P1n.dotProduct(P2P)));
    var nFactor=A2.magnitude()/(A1.magnitude()+A2.magnitude());
    var B1=P3P.subtractVector(P2Pn.multiplyValue(P2Pn.dotProduct(P3P)));
    var B2=P1P.subtractVector(P2Pn.multiplyValue(P2Pn.dotProduct(P1P)));
    var mFactor=B1.magnitude()/(B1.magnitude()+B2.magnitude());
    //apply m n to Normal and Texcoord
    //Texture
    T3T1=_Hit.HitFaceInfo[1].subtractVector(_Hit.HitFaceInfo[7]);
    Tcoord=_Hit.HitFaceInfo[7].addVector(T3T1.multiplyValue(mFactor));
    T2Tprime=Tcoord.subtractVector(_Hit.HitFaceInfo[4]);
    Tcoord=_Hit.HitFaceInfo[4].addVector(T2Tprime.multiplyValue(nFactor));
    _Hit.HitTextureCoord=Tcoord;//_Hit.HitFaceInfo[1].addVector(_Hit.HitFaceInfo[4]).addVector(_Hit.HitFaceInfo[7]).multiplyValue(1/3);
    //Normal
    N3N1=_Hit.HitFaceInfo[2].subtractVector(_Hit.HitFaceInfo[8]);
    Ncoord=_Hit.HitFaceInfo[8].addVector(N3N1.multiplyValue(mFactor));
    N2Nprime=Ncoord.subtractVector(_Hit.HitFaceInfo[5]);
    Ncoord=_Hit.HitFaceInfo[5].addVector(N2Nprime.multiplyValue(nFactor));
    _Hit.HitNormal=Ncoord;//_Hit.HitFaceInfo[2].addVector(_Hit.HitFaceInfo[5]).addVector(_Hit.HitFaceInfo[8]).multiplyValue(1/3);

    /*if(_Hit.HitTextureCoord.elements[0]==NaN||_Hit.HitTextureCoord.elements[1]==NaN)
     console.log("NAN");*/
    /*if(isNaN(_Hit.HitTextureCoord.elements[0])||isNaN(_Hit.HitTextureCoord.elements[1]))
        console.log("!");*/
    return _Hit;
}
function GetColorAtPosition(Cam,Objects,Lights,_Ray,_Hit,CurTraceDepth,MaxTraceDepth)
{

    var finalColor=new Vector3([0,0,0]);//=Diffuse*factorD+Reflection*factorRfl+Refraction*factorRfc
    if(_Hit==null)//ray goes into universe
    {
        var EnvColor=GetEnvColor(_Ray);
       return EnvColor;//return black
      // return new Vector3([0,0,0]);//return black
    }
    if(isNaN(_Hit.HitTextureCoord.elements[0])||isNaN(_Hit.HitTextureCoord.elements[1]))
        console.log("!");
    var SolidColor = GetSolidColor(Cam,Objects,Lights,_Ray,_Hit);
    var ReflectionColor=new Vector3([0,0,0]);
    var RefractionColor=new Vector3([0,0,0]);
    if(CurTraceDepth<MaxTraceDepth)
    {
        if(_Hit.HitObj.Material[5]>0)
            ReflectionColor=GetReflection(Cam,Objects,Lights,_Ray,_Hit,CurTraceDepth+1,MaxTraceDepth);
        if(_Hit.HitObj.Material[6]>0)
            RefractionColor=GetRefraction(Cam,Objects,Lights,_Ray,_Hit,CurTraceDepth+1,MaxTraceDepth);

    }
    //merge color
    if(RefractionColor=="fullyReflected")
    {
        finalColor=SolidColor.multiplyValue(_Hit.HitObj.Material[4])
            .addVector(ReflectionColor.multiplyValue(_Hit.HitObj.Material[5]+_Hit.HitObj.Material[6]))
    }else
    {
        finalColor=SolidColor.multiplyValue(_Hit.HitObj.Material[4])
        .addVector(ReflectionColor.multiplyValue(_Hit.HitObj.Material[5]))
        .addVector(RefractionColor.multiplyValue(_Hit.HitObj.Material[6]));
    }
    finalColor.elements[0]=finalColor.elements[0]>255?255:finalColor.elements[0];
    finalColor.elements[1]=finalColor.elements[1]>255?255:finalColor.elements[1];
    finalColor.elements[2]=finalColor.elements[2]>255?255:finalColor.elements[2];

    return finalColor;//new Vector3([255,255,255]);
}

function GetSolidColor(Cam,Objects,Lights,_Ray,_Hit)//emissive,ambient,diffuse,specular//shadow?,
{
    var finalColor=new Vector3([0,0,0]);
    //same as pixel shader
    //Phong lighting model - per-pixel
    //get Texture color of this point

    var pixelColor=TextureSampler(_Hit.HitObj.IMG,_Hit.HitTextureCoord.elements[0],_Hit.HitTextureCoord.elements[1]);
    //get Normal of this point (relative to world coord)
    var Normal=_Hit.HitObj.inverseTransposeTransform.multiplyVector3(_Hit.HitNormal).normalize();
    var EyeDir=new Vector3(_Ray.Dir.elements);


    for(iLight=0;iLight<Lights.length;iLight++)
    {
        //light In -World Coord
        var  LightPos=null;
        if(Lights[iLight].parent)//do transform if light is attached to parent object
        {
            LightPos=Lights[iLight].parent.Transform.multiplyVector3(Lights[iLight].position);
        }
        else
        {
            LightPos=Lights[iLight].position;
        }
        var LightDir=LightPos.subtractVector(_Hit.HitPosition).normalize();//from P to Light
        var nDotl=Math.max(0,LightDir.dotProduct(Normal) );
        var vecE=(EyeDir.multiplyValue(-1)).normalize();
        var vecR=  Normal.multiplyValue(2*Normal.dotProduct(LightDir)).subtractVector(LightDir).normalize();
        var spec= Math.pow(Math.max(0,vecE.dotProduct(vecR)),_Hit.HitObj.Material[3]);//shiness  float value
        var Attenuation = 1;
        var _ShadowRay=new Ray();
        _ShadowRay.Dir=new Vector4(LightDir.elements);
        _ShadowRay.Dir.elements[3]=0;
        _ShadowRay.Ori=new Vector4(_Hit.HitPosition.elements);
        _ShadowRay.Ori.elements[3]=1;
        var ShadowHit=GetNearestHit(_ShadowRay,Objects);
        if(ShadowHit)
        {
            Attenuation=ShadowHit.HitObj.Material[6];
        }
        if(Lights[iLight].type==1)//point light
        {
            Attenuation*=Lights[iLight].intensity/Math.sqrt(LightPos.distance(_Hit.HitPosition));
        }else if(Lights[iLight].type==2)//spot light
        {
            var SpotDir;
            if(Lights[iLight].direction)
            {
                SpotDir=new Vector3(Lights[iLight].direction.elements);
                if(Lights[iLight].parent)
                SpotDir=Lights[iLight].parent.Transform.multiplyVector3(SpotDir);
            }
            else
            SpotDir=new Vector3([0,-1,0]);
            var SpotCos=LightDir.dotProduct(SpotDir.normalize().multiplyValue(-1));///////?????????????
            if(SpotCos<0.707)
                Attenuation=0;
            else
                Attenuation*=Math.pow(SpotCos,1/Lights[iLight].intensity);
        }
        var diffuse=pixelColor.multiplyVec(Lights[iLight].color).multiplyVec(_Hit.HitObj.Material[1]).multiplyValue(nDotl*Attenuation);
        var ambient=Lights[iLight].ambient.multiplyValue(255);
        var specular=Lights[iLight].color.multiplyVec(_Hit.HitObj.Material[2]).multiplyValue(Attenuation*spec*255);
        finalColor=finalColor.addVector(diffuse.addVector(ambient).addVector(specular));
    }
    var emissive=pixelColor.multiplyVec(_Hit.HitObj.Material[0]);
    finalColor=finalColor.addVector(emissive);
    finalColor.elements[0]=finalColor.elements[0]>255?255:finalColor.elements[0];
    finalColor.elements[1]=finalColor.elements[1]>255?255:finalColor.elements[1];
    finalColor.elements[2]=finalColor.elements[2]>255?255:finalColor.elements[2];
    return finalColor;
}
function TextureSampler(IMGtexture,coordX,coordY)//Texture is image object, see whether the texture is upside down
{
    var canvasTemp=document.createElement("canvas");
    canvasTemp.width=IMGtexture.width;
    canvasTemp.height=IMGtexture.height;
    normalizedTx=coordX-Math.floor(coordX);
    normalizedTy=coordY-Math.floor(coordY);
    Texture=canvasTemp.getContext("2d")
    Texture.drawImage(IMGtexture,0,0);
    //image coord-texture coord left-0 right-1 up
    var Color=Texture.getImageData(normalizedTx*IMGtexture.width,(1-normalizedTy)*IMGtexture.height, 1, 1).data;
    //var Color=Texture.getImageData(100.9,23.9, 1, 1).data;//[r,g,b,a,r,g,b,a] if coordinate is integer, it returns 1 color, or it will return 4 nearby color
    /* if(Color[0]!=255||Color[1]!=255||Color[2]!=255)
     console.log(("not white"));*/
    return new Vector3([Color[0],Color[1],Color[2]]);
}
function GetReflection(Cam,Objects,Lights,_Ray,_Hit,CurTraceDepth,MaxTraceDepth)
{

    var ReflectionRay=new Ray();//calculate new ray
    var In=new Vector3(_Ray.Dir.elements).multiplyValue(-1).normalize();
    var Nml= _Hit.HitNormal.normalize();

    ReflectionRay.Dir=new Vector4(Nml.multiplyValue(2*Nml.dotProduct(In)).subtractVector(In).normalize().elements);
    ReflectionRay.Dir.elements[3]=0;
    ReflectionRay.Ori=new Vector4(_Hit.HitPosition.elements);
    ReflectionRay.Ori.elements[3]=1;

    console.log("Go into GetReflection");
    var NewHit=GetNearestHit(ReflectionRay,Objects,true);
    if(NewHit)
     console.log("Hit something in reflection");
    var color = GetColorAtPosition(Cam,Objects,Lights,ReflectionRay,NewHit,CurTraceDepth+1,MaxTraceDepth);
    return color;

}
function GetRefraction(Cam,Objects,Lights,_Ray,_Hit,CurTraceDepth,MaxTraceDepth)
{
    var RefractionRay=new Ray();//calculate new ray
    var In=new Vector3(_Ray.Dir.elements).normalize();//
    var Nml= _Hit.HitNormal.normalize();
    var Ics=In.dotProduct(Nml);
    //
    if(Ics<-0.8)
     console.log("attention!");
    var Rcs=null,k=null,n=_Hit.HitObj.Material[7];
    if(Ics<=0)//from exterior to interior
    {  Rcs=-Math.sqrt(1-(1-Ics*Ics)/(n*n));
        k=1/n;
    }
    else//from interior to exterior
    {
        Rcs=Math.sqrt(1-(1-Ics*Ics)*(n*n));
        if(isNaN(Rcs))
        {
            console.log("fullyReflected, no refraction");
            return "fullyReflected";
        }
        k=n;
    }
    var outN=Nml.multiplyValue(Rcs);//In has length of 1
    var outDelta=In.subtractVector(Nml.multiplyValue(Ics)).multiplyValue(k);
    RefractionRay.Dir=new Vector4(outN.addVector(outDelta).normalize().elements);
    RefractionRay.Dir.elements[3]=0;
    RefractionRay.Ori=new Vector4(_Hit.HitPosition.elements);
    RefractionRay.Ori.elements[3]=1;

    console.log("Go into GetRefraction");
    var NewHit=GetNearestHit(RefractionRay,Objects);
    if(NewHit)
        console.log("Hit something in refraction");
    var color = GetColorAtPosition(Cam,Objects,Lights,RefractionRay,NewHit,CurTraceDepth+1,MaxTraceDepth);
    return color;
}

function GetEnvColor(_Ray)
{
    offsetY=-40;
    x0=_Ray.Ori.elements[0]
    y0=_Ray.Ori.elements[1]+offsetY;
    z0=_Ray.Ori.elements[2];
    DirX=_Ray.Dir.elements[0];
    DirY=_Ray.Dir.elements[1];
    DirZ=_Ray.Dir.elements[2];
    // (x0+DirX*t)^2+(y0+DirY*t)^2+(z0+DirZ*t)^2-R^2=0
    // (DirX^2+DirY^2+DirZ^2)t^2 +2(DirX*x0+DirY*y0+DirZ*z0)t + (x0^2+y0^2+z0^2-R^2)=0
    paraA=DirX*DirX+DirY*DirY+DirZ*DirZ;
    paraB=2*(DirX*x0+DirY*y0+DirZ*z0);
    paraC=x0*x0+y0*y0+z0*z0-EnvRadiusR*EnvRadiusR;
    t=(-paraB+Math.sqrt(paraB*paraB-4*paraA*paraC))/(2*paraA);
    if(!t)
    {
        return new Vector3([0,0,0]);
    }
    IntscX= x0+t*DirX;
    IntscY=y0+t*DirY;
    IntscZ=z0+t*DirZ;
    Xcoord=-Math.atan2(IntscX,IntscZ)/(2*Math.PI)-1/2;//-PI~PI
    Ycoord=Math.atan(IntscY/Math.sqrt(IntscX*IntscX+IntscZ*IntscZ))/Math.PI+1/2;//-PI/2~PI/2
    return TextureSampler(EnvTexture,Xcoord,Ycoord);

}
////////////////////////////////////////////////////////////////////
///check whether a ray collide with plane in finite area///////////////////////////
function GetCollisionPointWithinArea(_Ray,P1,P2,P3,AreaType)//return a vector3
{
    Intsc  = GetCollisionPoint(_Ray,P1,P2,P3);//return a vector4

    var Res=null;
    if(Intsc)//if the ray has no intersection with the plane at all,return
    { //check if the collision point is within the triangle/rectangle area
        Res = new Vector3(Intsc.elements);
        if(AreaType=="Parallelogram")//area P1-P2-P1'-P3
        {
            if(IsPointInParallelogram(Res,P1,P2,P3)) return Res;
        }
        else if(AreaType=="Triangle")
        {
            if(IsPointInTriangle(Res,P1,P2,P3)) return Res;
        }
        else{ console.log("unidentified area type");return null;}
    }
     return null;//no collision at all

}
function GetCollisionPoint(_Ray,P1,P2,P3)//Get Collision point between Ray and face P1P2P3 (infinite plane)
{
    var x0x1=_Ray.Ori.elements[0]-P1.elements[0];
    var y0y1=_Ray.Ori.elements[1]-P1.elements[1];
    var z0z1=_Ray.Ori.elements[2]-P1.elements[2];
    var dirX=_Ray.Dir.elements[0];
    var dirY=_Ray.Dir.elements[1];
    var dirZ=_Ray.Dir.elements[2];
    var x2x1=P2.elements[0]-P1.elements[0];
    var x3x1=P3.elements[0]-P1.elements[0];
    var y2y1=P2.elements[1]-P1.elements[1];
    var y3y1=P3.elements[1]-P1.elements[1];
    var z2z1=P2.elements[2]-P1.elements[2];
    var z3z1=P3.elements[2]-P1.elements[2];
    var t=(z0z1*y2y1*x3x1+y0y1*x2x1*z3z1+x0x1*y3y1*z2z1-x0x1*y2y1*z3z1-z0z1*x2x1*y3y1-y0y1*z2z1*x3x1)
        /
        (dirX*y2y1*z3z1+dirZ*x2x1*y3y1+dirY*x3x1*z2z1-dirZ*y2y1*x3x1-dirY*x2x1*z3z1-dirX*y3y1*z2z1);
    if(t<=0)//if the collision is on the opposite direction or too near to the original point
    {  /*if(t>0)
        alert("");*/
        return null;}
    var OutPoint=_Ray.Ori.addVector(_Ray.Dir.multiplyValue(t));
    if( _Ray.Ori.distance(OutPoint)<0.00001)
        return null;
        return _Ray.Ori.addVector(_Ray.Dir.multiplyValue(t));
}
function IsPointInTriangle(P,A,B,C)//Vector3 - Points
{
    v0= B.subtractVector(A);
    v1= C.subtractVector(A);
    v2 = P.subtractVector(A);

    Dot00=v0.dotProduct(v0);
    Dot01=v0.dotProduct(v1);
    Dot02=v0.dotProduct(v2);
    Dot11=v1.dotProduct(v1);
    Dot12=v1.dotProduct(v2);
    InverDeno = 1/(Dot00*Dot11-Dot01*Dot01);
    u=(Dot11*Dot02-Dot01*Dot12)*InverDeno;
    if(u<0||u>1)
        return false;
    v=(Dot00*Dot12-Dot01*Dot02)*InverDeno;
    if(v<0||v>1)
        return false;

    return u+v<=1;
}
function IsPointInParallelogram(P,A,B,C)//parallelogram is ABA'C
{
    v0= B.subtractVector(A);
    v1= C.subtractVector(A);
    v2 = P.subtractVector(A);

    Dot00=v0.dotProduct(v0);
    Dot01=v0.dotProduct(v1);
    Dot02=v0.dotProduct(v2);
    Dot11=v1.dotProduct(v1);
    Dot12=v1.dotProduct(v2);
    InverDeno = 1/(Dot00*Dot11-Dot01*Dot01);
    u=(Dot11*Dot02-Dot01*Dot12)*InverDeno;
    if(u<0||u>1)
        return false;
    v=(Dot00*Dot12-Dot01*Dot02)*InverDeno;
    if(v<0||v>1)
        return false;

    return true;
}
//////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
function CheckBoundingBoxCollision(_Ray,Boundingbox)
{
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[0],Boundingbox[1],Boundingbox[2],"Parallelogram"))return true;
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[0],Boundingbox[1],Boundingbox[3],"Parallelogram"))return true;
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[0],Boundingbox[2],Boundingbox[3],"Parallelogram"))return true;
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[4],Boundingbox[5],Boundingbox[6],"Parallelogram"))return true;
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[4],Boundingbox[5],Boundingbox[7],"Parallelogram"))return true;
    if(GetCollisionPointWithinArea(_Ray,Boundingbox[4],Boundingbox[6],Boundingbox[7],"Parallelogram"))return true;

        return false;
}
