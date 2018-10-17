using UnityEngine;
using System.Collections;

public class ShowFps : MonoBehaviour 
{

	private float updateInterval = 1.0f;
	private double lastInterval; // Last interval end time
	private int frames = 0; // Frames over current interval
	private string text = "";
	private GUIStyle style = new GUIStyle();
	
	// Use this for initialization
	void Start () 
	{
    	lastInterval = Time.realtimeSinceStartup;
    	frames = 0;	
		
		style.normal.textColor = Color.black;
	}
	
	// Update is called once per frame
	void Update () 
	{
	    ++frames;
	    var timeNow = Time.realtimeSinceStartup;
	    if ( timeNow > lastInterval + updateInterval )
	    {
#if UNITY_EDITOR 
			//|| UNITY_IPHONE || UNITY_ANDROID	
			float fps = frames / ( ( float ) (timeNow - lastInterval) );
			float ms = 1000.0f / Mathf.Max (fps, 0.00001f);
			text = ms.ToString("f1") + "ms " + fps.ToString("f2") + "FPS";
#else		
			float fps = frames / ( ( float ) (timeNow - lastInterval) );
			text = fps.ToString("f2") + "FPS";
#endif			
	        frames = 0;
	        lastInterval = timeNow;
	    }		
	}
	
	void OnGUI ()
	{
		float w = style.CalcSize( new GUIContent( text ) ).x;
		GUI.Label( new Rect( Screen.width - w - 5, 100, w, 100 ), text, style );	
	}
}
