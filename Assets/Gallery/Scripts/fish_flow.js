#pragma strict
var startPosition = Vector3.zero;
var tmpMoveTan = Vector3.zero;
var tmpValue = 0.1;
var tmpTran = Vector3.zero;
var moveSpeed = 0.7;
var dists:float;
var ani:Animation;
var controller : CharacterController;
function Start () {
	startPosition = transform.position;
	ani = GetComponent(Animation);
	controller = GetComponent(CharacterController);
}

function Update () {
	//计算游动距离
	var dist = Vector3.Distance(startPosition, transform.position);
	ani.Play();
	dists = Vector3.Distance(tmpTran, transform.position);
	tmpTran = transform.position;
	if (dists < 0.01) {
		tmpMoveTan = Vector3.forward;
		tmpMoveTan = transform.TransformDirection(tmpMoveTan);
        tmpMoveTan *= 1;
        controller.Move(tmpMoveTan * Time.deltaTime);
        if (tmpValue > 0.5) {
			transform.Rotate(0,60,0);
		} else {
			transform.Rotate(0,-60,0);
		}
		return;
	}
	if (dist > 4) {//游动距离超过2米开始停歇
		tmpMoveTan = Vector3.forward;
		tmpMoveTan = transform.TransformDirection(tmpMoveTan);
        tmpMoveTan *= moveSpeed;
        controller.Move(tmpMoveTan * Time.deltaTime);
		if (dist >2.5) {//超过2.5米开始掉头
			if (tmpValue > 0.5) {
				transform.Rotate(Vector3.up * Time.deltaTime*60);
			} else {
				transform.Rotate(-Vector3.up * Time.deltaTime*60);
			}
		}
		if (dist > 2.8) {
			startPosition = transform.position;
			//生成随机数
			tmpValue = Random.value;
		}
	} else {
	 	tmpMoveTan = Vector3.forward;
		tmpMoveTan = transform.TransformDirection(tmpMoveTan);
        tmpMoveTan *= moveSpeed+0.3;
        controller.Move(tmpMoveTan * Time.deltaTime);
	}
}