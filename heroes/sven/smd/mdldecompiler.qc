$cd "H:\dota2resources\heros\sven\smd"
$modelname "heroes/sven/sven.mdl"
$model "default" "sven_model.dmx.smd"

$lod 1
 {
  replacemodel "sven_model.dmx" "lod1_sven_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/sven/sven_color.vmt" }
	{ "models/items/sven/sven_body.vmt" }
}
$hboxset "default"
$hbox 0 "head" -7.680  -13.037  -4.663  11.925  12.990  15.828
$hbox 0 "wrist_R" -11.149  -6.318  -5.813  -0.332  7.950  12.009
$hbox 0 "elbow_R" -23.424  -5.878  -9.661  -0.200  8.576  6.666
$hbox 0 "bicep_R" -27.063  -6.709  -12.164  -1.068  7.606  9.879
$hbox 0 "sword_1" -168.012  -38.424  -29.855  -18.134  9.710  -0.965
$hbox 0 "wrist_L" 0.719  -11.572  -12.391  16.436  1.015  2.298
$hbox 0 "elbow_L" -4.904  -11.495  -8.481  31.043  9.091  12.350
$hbox 0 "bicep_L" 6.026  -10.634  -11.785  38.592  7.321  11.379
$hbox 0 "spine3" -12.837  -28.487  -18.736  16.973  26.952  14.485
$hbox 0 "spine2" -8.720  -27.341  -20.465  6.421  23.715  7.115
$hbox 0 "spine1" -8.372  -19.672  -17.958  10.712  20.557  3.772
$hbox 0 "ankle_L" -3.911  -4.217  -11.559  18.549  10.503  8.711
$hbox 0 "knee_L" -10.418  -7.297  -14.231  37.485  9.657  8.283
$hbox 0 "thigh_L" 7.446  -12.983  -10.198  35.529  7.808  13.188
$hbox 0 "ankle_R" -18.554  -10.551  -8.717  3.899  4.057  11.553
$hbox 0 "knee_R" -37.522  -9.164  -8.357  10.415  7.195  14.228
$hbox 0 "thigh_R" -35.532  -7.998  -13.035  -5.334  13.167  10.566
$hbox 0 "root" -14.380  -15.453  -21.078  19.650  16.047  7.552
$hboxset "select_high"
$hbox 0 "root" -40.240  -43.813  -120.028  45.510  44.407  -7.412
$hbox 0 "root" -23.184  -37.046  -7.479  38.798  35.512  48.162
$hboxset "select_low"
$hbox 0 "root" -65.949  -73.011  -117.932  71.219  73.605  54.298
$hboxset "head"
$hbox 0 "head" -7.680  -12.918  -4.663  11.925  12.871  15.828
$hboxset "hands"
$hbox 0 "wrist_R" -11.149  -6.318  -5.813  -0.332  7.950  12.009
$hbox 0 "wrist_R" -11.149  -6.318  -5.813  -0.332  7.950  12.009
$hbox 0 "wrist_L" 0.719  -11.572  -12.391  16.436  1.015  2.298
$hbox 0 "wrist_L" 0.719  -11.572  -12.391  16.436  1.015  2.298
$hboxset "weapon"
$hbox 0 "sword_1" -169.997  -28.861  -25.233  -39.962  2.152  -10.696
$hboxset "feet"
$hbox 0 "ankle_L" -3.911  -4.217  -11.559  18.549  10.503  8.711
$hbox 0 "ankle_R" -18.554  -10.551  -8.717  3.899  4.057  11.553
$attachment "attach_head" "head" 13.68 0.00 4.00 rotate -0.00 90.00 90.00
$attachment "attach_attack1" "sword_1" -0.30 0.26 1.54 rotate 10.65 96.22 -99.80
$attachment "attach_sword" "sword_1" -90.00 -10.00 -14.00 rotate 90.00 180.00 0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate -0.00 90.00 55.35
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 46.540 0.297 63.981
$sequence BindPose "BindPose" fps 30.00
$sequence spawn_temp "spawn_temp" ACT_DOTA_SPAWN 1 fps 30.00
$sequence runN "runN" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 2 "Hero_Sven.Footsteps" }
  { event AE_CL_PLAYSOUND 14 "Hero_Sven.Footsteps" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_portrait "idle_portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence idle_alt1 "idle_alt1" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence attack01 "attack01" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 10 "SVEN_ATTACK_BLUR start_at_origin attach_sword" }
  { event AE_DOTA_PLAY_SOUND_ATTACK 10 }
}

$sequence attack03 "attack03" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 10 "SVEN_ATTACK_BLUR start_at_origin attach_sword" }
  { event AE_DOTA_PLAY_SOUND_ATTACK 10 }
}

$sequence attack02 "attack02" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_CL_CREATE_PARTICLE_EFFECT 8 "SVEN_ATTACK_BLUR_2 start_at_origin attach_sword" }
  { event AE_DOTA_PLAY_SOUND_ATTACK 8 }
}

$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 19 "BodyImpact_Common.Medium" }
  { event AE_CL_PLAYSOUND 19 "WeaponImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 7 "WeaponImpact_Common.Heavy" }
}

$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence storm_bolt "storm_bolt" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence warcry "warcry" ACT_DOTA_OVERRIDE_ABILITY_3 1 fps 30.00
$sequence gods_strength "gods_strength" ACT_DOTA_OVERRIDE_ABILITY_4 1 fps 30.00
$sequence blade_spin "blade_spin" ACT_DOTA_TAUNT 1 fps 30.00
$sequence workshop_anim_00 "workshop_anim_00" fps 30.00
$sequence workshop_anim_01 "workshop_anim_01" fps 30.00
$sequence workshop_anim_02 "workshop_anim_02" fps 30.00
$sequence workshop_anim_03 "workshop_anim_03" fps 30.00
$sequence workshop_anim_04 "workshop_anim_04" fps 30.00
$sequence workshop_anim_05 "workshop_anim_05" fps 30.00
$sequence workshop_anim_06 "workshop_anim_06" fps 30.00
$sequence workshop_anim_07 "workshop_anim_07" fps 30.00
$sequence workshop_anim_08 "workshop_anim_08" fps 30.00
$sequence workshop_anim_09 "workshop_anim_09" fps 30.00
$sequence turn layer_lookFrame_0 "turn layer_lookFrame_0" fps 30.00
$sequence turn layer_lookFrame_1 "turn layer_lookFrame_1" fps 30.00
$sequence turn layer_lookFrame_2 "turn layer_lookFrame_2" fps 30.00
$sequence turn layer "turn layer_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turn layer_lookFrame_0 turn layer_lookFrame_1 turn layer_lookFrame_2
}
