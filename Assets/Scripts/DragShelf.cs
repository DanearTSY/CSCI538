using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DragShelf : MonoBehaviour {

    public Transform myTransform;
    //public Camera playerCam;
    Vector3 selfScenePosition;

    private float clip(float x, float limit1, float limit2)
    {
        if (x > limit1) x = limit1;
        else if (x < limit2) x = limit2;

        return x;
    }


    // Use this for initialization
    void Start () {
        
        //将自身坐标转换为屏幕坐标
        selfScenePosition = Camera.main.WorldToScreenPoint(myTransform.position);
        print("scenePosition   :  " + selfScenePosition);

    }

    // Update is called once per frame
    void OnMouseDrag() {
        print("鼠标拖动该模型区域时");
        //获取拖拽点鼠标坐标
        print(Input.mousePosition.x + "     y  " + Input.mousePosition.y + "     z  " + Input.mousePosition.z);
        //新的屏幕点坐标
        Vector3 currentScenePosition = new Vector3(Input.mousePosition.x, Input.mousePosition.y, selfScenePosition.z);
        print("" + currentScenePosition);
        //将屏幕坐标转换为世界坐标
        Vector3 crrrentWorldPosition = Camera.main.ScreenToWorldPoint(currentScenePosition);
        print("666- " + crrrentWorldPosition);
        crrrentWorldPosition.x = clip(crrrentWorldPosition.x - 2, -3.4f,-4.4f);
        crrrentWorldPosition.z = myTransform.position.z;
        crrrentWorldPosition.y = myTransform.position.y;
        print("666" + crrrentWorldPosition);
        //设置对象位置为鼠标的世界位置

        //myTransform.position.Set(currentScenePosition.x, currentScenePosition.y, currentScenePosition.z);
        myTransform.position = crrrentWorldPosition;
    }
   
    void OnMouseDown()
    {
        print("鼠标按下时");
    }

    void OnMouseUp()
    {
        print("鼠标抬起时");
    }

    void OnMouseEnter()
    {
        print("鼠标进入该对象区域时");
    }

    void OnMouseExit()
    {
        print("鼠标离开该模型区域时");
    }
}
