#pragma strict

function OnGUI () {
         if (GUI.Button (Rect (Screen.width-90,10,75,30), "退出")) {
                   Application.Quit();
         }

}

 function Update () {
    if (Input.GetKey ("escape")) {
        Application.Quit();
    }
}