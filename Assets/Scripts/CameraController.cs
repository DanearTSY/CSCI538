using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour {

    public float sensitivityX = 1f;
    public float sensitivityY = 0.5f;
    public GameObject Dart;
    private Camera camera;
    private List<string> items;

	// Use this for initialization
	void Start () {
        camera = GetComponentInChildren<Camera>();
        items = new List<string>(); 
	}
	
	// Update is called once per frame
	void Update () {
        float mouseX = Input.GetAxis("Mouse X") * sensitivityX;
        float mouseY = Input.GetAxis("Mouse Y") * sensitivityY;
        camera.transform.localRotation *= Quaternion.Euler(-mouseY, mouseX, 0);

        Ray r;
        RaycastHit hit;
        if(Input.GetMouseButtonDown(0)){
            r = Camera.main.ScreenPointToRay(Input.mousePosition);
            if(Physics.Raycast(r, out hit)){
                switch(hit.collider.gameObject.name){
                    case "Key":
                        Destroy(hit.collider.gameObject);
                        items.Add("Key");
                        break;
                    case "Door":
                        if(items.Contains("Key")){
                            Destroy(hit.collider.gameObject);
                        }
                        break;
                    case "Dartboard1":
                    case "Dartboard2":
                    case "Dartboard3":
                        GameObject dart = GameObject.Instantiate(Dart, transform.position, Quaternion.identity);
                        Vector3 dir = hit.point - transform.position;
                        dart.GetComponent<Rigidbody>().AddForce(dir * 200);
                        break;
                }
            }
        }
	}
}
