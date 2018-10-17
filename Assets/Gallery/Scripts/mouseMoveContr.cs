using UnityEngine;
using System.Collections;

public class mouseMoveContr : MonoBehaviour {
	public const int PLAY_IDLE = 0;
	public const int PLAY_WALK = 1;
	public const int PLAY_RUN  = 2;
	public const int PLAY_KNEE  = 3;
	public GameObject clickPont;
	public float walkSpeed = 2;
	public float runSpeed = 4.5f;
	
	private bool moveflag = false;
	
	private int gameState = 0;
	private Vector3 point;
	private float time;
	private Vector3 v;
	private Vector3 lotav;
	private float moveSpeed = 0.0f;
	
	void Start () {
		SetGameState(PLAY_IDLE);
	}
	
	void Update () {
		MouseDownMover();
	}
	public void MouseDownMover() {
		if(Input.GetMouseButtonDown(0)) {
			LayerMask layerMaskPlayers = 1 << LayerMask.NameToLayer("Terrain");
			Ray ray = Camera.main.ScreenPointToRay(Input.mousePosition);
			RaycastHit hit;
			if (Physics.Raycast(ray, out hit,600,layerMaskPlayers.value)) {
				point = hit.point;
				Instantiate(clickPont, point, transform.rotation);
				TimeRealtimeSinceStartup();
			}
		}
	}
	public void TimeRealtimeSinceStartup() {
		if(Time.realtimeSinceStartup - time <=0.2f) {
			SetGameState(PLAY_RUN);
		} else {
			SetGameState(PLAY_WALK);
		}
		time = Time.realtimeSinceStartup;
	}
	public void FixedUpdate() {
		switch(gameState) {
			case PLAY_IDLE:
				break;
			case PLAY_WALK:
				SetGameState(PLAY_WALK);
				Move(walkSpeed);
				break;
			case PLAY_RUN:
				SetGameState(PLAY_RUN);
				Move(runSpeed);
				break;
		}
	}
	public void SetGameState(int  state) {
		switch(state) {
			case PLAY_IDLE:
				point = transform.position;
				//animation.Play("idle");
				break;
			case PLAY_WALK:
				//animation.Play("walk");
				break;
			case PLAY_RUN:
				//animation.Play("run");
				break;
		}
		gameState = state;
	}
	public void Move(float speed) {
		if(Mathf.Abs(Vector3.Distance(point, transform.position))>=0.2f) {
			moveflag = true;
			CharacterController controller  = GetComponent<CharacterController>();
			v = Vector3.ClampMagnitude(point -  transform.position,speed);
			v.y = 0;
		} else {
			moveflag = false;
			SetGameState(PLAY_IDLE);
		}
		moveSpeed = speed;
	}
	public bool getmousemoveFlag() {
		return moveflag;
	}
		public void setMouseMoveFlag() {
		moveflag = false;
		point = transform.position;
	}
	public Vector3 getMovement() {
		return v;
	}
	public float getMoveSpeed() {
		return moveSpeed;
	}
}
