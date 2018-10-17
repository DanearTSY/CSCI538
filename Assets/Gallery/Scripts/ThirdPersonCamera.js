
/*
Perfect Camera Control Script  By zhoy;
Which can be toggled between First-Person Look And Third-Person Look 
And it also realised freely Look-around  the world with mouse move
*/

var cameraTransform : Transform;
var distance = 7.0;

var xSpeed = 100;
var ySpeed = 100;
var mSpeed = 10;

var angularSmoothLag = 0.3;
var angularMaxSpeed = 15.0;

var snapSmoothLag = 0.2;
var snapMaxSpeed = 720.0;

var clampHeadPositionScreenSpace = 0.75;


private var _target : Transform;

//var secondCamera : Camera;
private var mainCamera : Camera;

private var controller : ThirdPersonController;

private var headOffset    = Vector3.zero;
private var centerOffset  = Vector3.zero;


private var dosnap     = false;
private var snapped    = false;
private var firstPersonLook  = false;
private var angleVelocity    = 0.0;

private var minAngleY   = -45;
private var yTopLimit   = -20.0;
private var yMinLimit   = -45;
private var yMaxLimit   =  45;
private var minDistance =  1.2;
private var maxDistance =  3.5;


private var current_ver_angle  = 0.0;
private var current_hor_angle  = 0.0;
private var look_height        = 0.0;

private var bSeePicture = false;
private var curPicturePos:Vector3;
private var curPictureRotation:Quaternion;
private var curPictureTran: Transform;
function Awake ()
{
	//secondCamera.enabled = false;
	mainCamera = Camera.main;
	cameraTransform = GameObject.Find("Main Camera").transform;
	if(!cameraTransform && mainCamera)
	{
		cameraTransform = mainCamera.transform;
	}

	if(!cameraTransform) 
	{
		Debug.Log("Please assign a camera to the ThirdPersonCamera script.");
		enabled = false;	
	}
				
	_target = transform;
	if (_target)
	{
		controller = _target.GetComponent(ThirdPersonController);
	}
	
	if (controller)
	{
		var characterController : CharacterController = _target.GetComponent.<Collider>();
		centerOffset = characterController.bounds.center - _target.position;
		headOffset = centerOffset;
		

		var look_target = _target.Find("LookTarget");
		//Debug.Log(look_target);
		var head_back_pos    = characterController.bounds.max;
		if(look_target)
		{
			head_back_pos = look_target.transform.position;
		}
		var hit_test : RaycastHit;	
		var head_top = characterController.bounds.center;
		head_top.y = characterController.bounds.min.y;
		
		if(Physics.Raycast(head_top,Vector3.down,hit_test,50))
		{
			look_height = head_back_pos.y - hit_test.point.y;	
		}		
	
		headOffset.y = head_back_pos.y - _target.position.y;

		/*下面计算、保存 相机稳定后 的初始位置与方位*/	
		var hor_angle = _target.eulerAngles.y;			
		var rotation_h = Quaternion.Euler (0, hor_angle, 0);	
		var camera_pos = head_back_pos;
		
		camera_pos += rotation_h * Vector3.back * distance;	/*计算相机位置是用 头部为球中心计算的*/
		
		var offsetToCenter = head_back_pos - camera_pos;
		var rotation = Quaternion.LookRotation(Vector3(offsetToCenter.x, offsetToCenter.y, offsetToCenter.z));
		current_hor_angle = 360 - rotation.eulerAngles.y;
		current_ver_angle = rotation.eulerAngles.x;	
	}
	else
	{
		Debug.Log("Please assign a target to the camera that has a ThirdPersonController script attached.");
	}

	Cut(_target, centerOffset);	
}

function SetVisible(visible)
{
	var renderers = gameObject.GetComponentsInChildren(Renderer);
	if(visible)
	{ 
		for(var rend:Renderer in renderers){
			rend.enabled = true;
		}
		firstPersonLook = false;
	}
	else
	{ 
		for(var rend:Renderer in renderers)
		{
			rend.enabled = false;
		}
		firstPersonLook = true;	
	}
}
function Cut (dummyTarget : Transform, dummyCenter : Vector3)
{
	var oldSnapMaxSpeed   = snapMaxSpeed;
	var oldSnapSmooth     = snapSmoothLag;
	
	snapMaxSpeed = 10000;
	snapSmoothLag = 0.001;
	
	dosnap  = true;

	Apply (transform, Vector3.zero);
	
	snapMaxSpeed = oldSnapMaxSpeed;
	snapSmoothLag = oldSnapSmooth;
}

function DebugDrawStuff ()
{
	Debug.DrawLine(_target.position, _target.position + headOffset);
}

function AngleDistance (a : float, b : float)
{
	a = Mathf.Repeat(a, 360);
	b = Mathf.Repeat(b, 360);
	
	return Mathf.Abs(b - a);
}


function Apply (dummyTarget : Transform, dummyCenter : Vector3)
{
     
	// Early out if we don't have a target
	if (!controller)
	{
		return;
	}
	var needGoOn = false;	
	var targetCenter = _target.position + centerOffset;
	var targetHead = _target.position + headOffset;

	var strength = Input.GetAxis("Mouse ScrollWheel");
	if(strength != 0)
	{
		distance -= strength*mSpeed;
		distance =  Mathf.Clamp(distance, minDistance, maxDistance);	
		/*
		if(distance <= 1)
		{
			SetVisible(false);
			minAngleY = -80;		
		}	
		else if(firstPersonLook)
		{
			SetVisible(true);
		}	
		else if(distance < look_height)
		{
			minAngleY = (distance - 2) * (yTopLimit - yMinLimit)/(look_height - 2) - yTopLimit;	
			minAngleY = - minAngleY;		
		}
		else
		{
			minAngleY = yMinLimit;
		}
		*/
		needGoOn = true;		
	}

	var originalTargetAngle = 360 - _target.eulerAngles.y;	
	current_hor_angle = 360 - cameraTransform.eulerAngles.y;
	if(!snapped)
	{
		var targetAngle = originalTargetAngle; 	
		var dis_angle = 0;	
		if (dosnap)
		{
			dis_angle = AngleDistance (360 - current_hor_angle, originalTargetAngle);
			current_hor_angle = Mathf.SmoothDampAngle(current_hor_angle, targetAngle, angleVelocity, snapSmoothLag, snapMaxSpeed);	
		}
	
			// We are close to the target, so we can stop snapping now!
		dis_angle= 0;
		if (dis_angle <= 10)
		{
			snapped = true;
			dosnap  = false;
	
		}
		else if(dis_angle < 3)
		{
			dosnap  = false;		
		}
		if(!snapped && !dosnap)
		{
			current_hor_angle = Mathf.SmoothDampAngle(current_hor_angle, targetAngle, angleVelocity, angularSmoothLag, angularMaxSpeed);			
		}
		needGoOn = true;
	}
	else
	{
	        var rotation_h =0;
			var rotation_v =0;	
		if (Input.GetMouseButton(1)) {
			 rotation_h =  -Input.GetAxis("Mouse X") * xSpeed *0.02;
			 rotation_v =  -Input.GetAxis("Mouse Y") * ySpeed *0.02;	
			
		}
		needGoOn = needGoOn || (rotation_h != 0 || rotation_v != 0);
			
		current_hor_angle += rotation_h;	
		current_hor_angle = Mathf.Repeat(current_hor_angle, 360);		
		current_ver_angle += rotation_v;
		current_ver_angle = Mathf.Clamp (current_ver_angle, minAngleY, yMaxLimit);
		
	}

	needGoOn = needGoOn || controller.IsMoving();
	needGoOn = needGoOn || controller.IsJumping();	
	if(!needGoOn)/*没有鼠标键盘事件，返回即可，相机一般不会自动更新。除非未来有其他情形，那时候再添加*/
	{
		var mousecl = GetComponent("mouseMoveContr");
		var mouseMoveFlag = mousecl.getmousemoveFlag();
		if (!mouseMoveFlag) {
			return;
		}
	}
		
	var rad_angle_h = (current_hor_angle - 90.0)*Mathf.Deg2Rad;
	var rad_angle_v = current_ver_angle*Mathf.Deg2Rad;
	var camera_pos = Vector3.zero;
	var radius_hor =  distance*Mathf.Cos(rad_angle_v);	
	var slope      = -Mathf.Sin(rad_angle_v);	
	
	camera_pos.x = radius_hor*Mathf.Cos(rad_angle_h) + targetHead.x;/*计算相机位置是用 头部为球中心计算的*/
	camera_pos.z = radius_hor*Mathf.Sin(rad_angle_h) + targetHead.z;	
	camera_pos.y = -distance*slope + targetHead.y;	
	if(camera_pos.y < targetHead.y - look_height)
	{
		camera_pos.y = targetHead.y - look_height;
	}
	
	var hit : RaycastHit;
	var modified = false;
	
	var hor_dis     = 0.0;
	
	if(camera_pos.y < targetCenter.y)
	{	
		var testPt = camera_pos;
		testPt.y = targetCenter.y;	
		if(Physics.Raycast(testPt,Vector3.down,hit,50))/*这个检测必须进行，不能完全指望后面的检测，否则会有微小的显示问题。一般发生在摄像机贴近地面跑动时*/
		{
			if(camera_pos.y < hit.point.y + 0.5)/*偏移0.5.防止过于接近地面，并且在地面上面的情况，会因为摄像机近截面问题。导致显示地下的内容*/
			{
				modified = true;					
			}					
		}	
	}
	if(modified)
	{		
		hor_dis  = Vector3.Distance(targetCenter,Vector3(camera_pos.x,targetCenter.y,camera_pos.z));			
		camera_pos = hit.point;
		camera_pos.y = (slope > 0.95)?hit.point.y:(camera_pos.y + hor_dis/maxDistance);
		//摄像头在脚下的时候，hor_dis几乎为0
		modified = false;
		//Debug.Log("hit down.....camera_pos : " +camera_pos);		
	}	

	var real_dis = Vector3.Distance(targetCenter,camera_pos);
	var direction = camera_pos - targetCenter;

	if(Physics.Raycast(targetCenter,direction,hit,real_dis) && hit.collider.gameObject != gameObject)
	{
//		modified = false;
//		if(hit.collider.bounds.size.magnitude <= 15) {
//			modified = false;	
//		} else if (hit.collider.gameObject.tag == "bridge") {
//			camera_pos.y = camera_pos.y + 2.5;
//		} else if (hit.collider.gameObject.tag == "through"){
//			modified = false;
//		} else {
//			modified = true;
//		}
//		Debug.LogError(hit.point.y < targetHead.y);
		camera_pos = hit.point;
		if(hit.point.y < targetHead.y){
			camera_pos.y = targetHead.y;
//			Debug.LogError(camera_pos);
		}
	}
//	
//	if(modified)
//	{	
//		hor_dis  = Vector3.Distance(targetCenter,Vector3(camera_pos.x,targetCenter.y,camera_pos.z));			
//		camera_pos   = hit.point;
//		camera_pos.y = (slope > 0.95)?hit.point.y:(camera_pos.y + hor_dis/maxDistance);/*摄像头在脚下的时候，hor_dis几乎为0*/	
//	}	
	cameraTransform.position = camera_pos;	
	var offsetToCenter = targetHead - cameraTransform.position;
	cameraTransform.rotation = Quaternion.LookRotation(Vector3(offsetToCenter.x, offsetToCenter.y, offsetToCenter.z));
	Debug.DrawLine(targetHead, camera_pos, Color.red);
}

function EventMouseClicked(){
//	Debug.LogError(Input.mousePosition);
	var mousePos:Vector3 = Input.mousePosition;
	var ray:Ray;
	ray = Camera.main.ScreenPointToRay(mousePos);
	var hitInfo:RaycastHit;
	var cameraTran:Transform;
	cameraTran = Camera.main.transform;
	if(Input.GetMouseButtonDown(0)){
		if(Physics.Raycast(ray, hitInfo, 50f, (1<<9))){
			Debug.LogError(hitInfo.transform.gameObject.layer);
//			curPicturePos = hitInfo.point;
//			curPicturePos = hitInfo.transform.Find("CameraPos").position;
//			curPictureRotation = hitInfo.transform.Find("CameraPos").rotation;
			curPictureTran = hitInfo.transform.Find("CameraPos");
			bSeePicture = !bSeePicture;
			if(bSeePicture){
				GetComponent(ThirdPersonController).enabled = false;
			}else{
				GetComponent(ThirdPersonController).enabled = true;
			}
		}
	}
}
function LateUpdate () 
{
	if (Input.GetKeyUp (KeyCode.Tab))
	{
		var hit2 : RaycastHit; 
		Debug.Log("Camera Pos.y : " + cameraTransform.position.y);
		var testPt = cameraTransform.position;
		testPt.y = 50;	
		if(Physics.Raycast(testPt,Vector3.down,hit2,50))
		{
			Debug.Log("hit2.point.y : " + hit2.point.y);		
		}	   	
	}
	EventMouseClicked();
	if(!bSeePicture){
		Apply (transform, Vector3.zero);
	}else{
//		Camera.main.transform.position = transform.position;
//		Camera.main.transform.position.y = curPicturePos.y;
////		Camera.main.transform.rotation = Quaternion.LookRotation(curPicturePos - Camera.main.transform.position);
//		Camera.main.transform.rotation = transform.rotation;
//		Camera.main.transform.position = curPicturePos;
//		Camera.main.transform.rotation = curPictureRotation;
		Camera.main.transform.rotation = curPictureTran.rotation;
		Camera.main.transform.position = curPictureTran.position;
	}
}

function GetCenterOffset ()
{
	return centerOffset;
}
/*
function UpdateSecondCamPos(lookat,campos)
{
	var ccnter  = Vector3.Lerp(campos,lookat,0.5);
	var forward = ccnter - campos;
	forward = forward.normalized;
	forward.y = 0;
	var right = Vector3.Cross (Vector3.up, forward);
	var setpos = ccnter + right*30;
	
	secondCamera.transform.position = setpos;
	var offset = ccnter - setpos;
	//Debug.DrawRay(campos,lookat - campos,Color.red,100000);
	var t1 = Time.time;
	GameObject.Find("TestObject").transform.position = campos;
	var t2= Time.time;
	
	secondCamera.transform.rotation = Quaternion.LookRotation(Vector3(offset.x, offset.y, offset.z));	
}
*/
/*
if (Input.GetKeyUp (KeyCode.Tab))
{
	var hit2 : RaycastHit; 
	Debug.Log("Camera Pos.y : " + cameraTransform.position.y);
	var testPt = cameraTransform.position;
	testPt.y = 50;	
	if(Physics.Raycast(testPt,Vector3.down,hit2,50))
	{
		Debug.Log("hit2.point.y : " + hit2.point.y);		
	}	   	

	if(mainCamera.enabled)
	{
   		controller.SwitchCamera(secondCamera); 

	}
	else
	{
   		controller.SwitchCamera(mainCamera); 				   	
	}

}	
*/
  