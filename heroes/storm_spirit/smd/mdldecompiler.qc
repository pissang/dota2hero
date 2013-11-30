$cd "H:\dota2resources\heros\storm_spirit\smd"
$modelname "heroes/storm_spirit/storm_spirit.mdl"
$model "default" "storm_spirit_model.dmx.smd"

$lod 1
 {
  replacemodel "storm_spirit_model.dmx" "lod1_storm_spirit_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "ankle_L" -5.023  -8.019  -6.224  12.993  8.205  5.899
$hbox 0 "knee_L" -4.774  -9.236  -10.387  30.710  11.443  9.674
$hbox 0 "thigh_L" 1.423  -11.295  -12.058  29.456  12.792  11.639
$hbox 0 "Head_1" -13.355  -9.688  -10.565  13.958  14.389  10.565
$hbox 0 "wrist_L" -1.353  -7.624  -4.146  12.948  6.629  5.229
$hbox 0 "elbow_L" 0.136  -7.025  -5.730  19.003  6.267  8.248
$hbox 0 "bicep_L" -1.743  -10.197  -7.265  22.508  13.675  10.033
$hbox 0 "wrist_R" -12.957  -6.617  -5.204  1.078  7.507  4.190
$hbox 0 "elbow_R" -20.459  -6.516  -7.622  -2.338  6.361  6.109
$hbox 0 "bicep_R" -25.575  -12.147  -7.683  0.049  9.643  7.892
$hbox 0 "Spine_3" -13.530  -14.086  -15.702  11.774  19.685  15.702
$hbox 0 "Spine_1" -1.347  -18.848  -21.713  17.407  22.873  21.713
$hbox 0 "ankle_R" -12.993  -5.221  -5.899  5.023  8.019  6.224
$hbox 0 "knee_R" -32.271  -11.399  -8.934  6.112  10.496  8.900
$hbox 0 "thigh_R" -29.456  -12.792  -11.639  -1.423  11.295  12.058
$hbox 0 "Root_0" -15.696  -17.544  -22.148  20.786  21.904  22.148
$hboxset "feet"
$hbox 0 "ankle_L" -8.462  -7.248  -8.390  16.431  7.433  8.065
$hbox 0 "ankle_R" -16.431  -4.591  -8.065  8.462  7.390  8.390
$hboxset "head"
$hbox 0 "Head_1" -11.545  -10.144  -12.001  13.989  15.028  12.001
$hboxset "hands"
$hbox 0 "wrist_L" -2.909  -9.175  -4.447  14.504  8.179  5.530
$hbox 0 "wrist_R" -14.484  -8.154  -5.505  2.604  9.044  4.491
$hboxset "select_high"
$hbox 0 "Spine_2" -25.805  -20.056  -21.529  39.417  21.458  22.335
$hbox 0 "Root_0" -69.953  -29.858  -32.225  31.965  34.218  32.225
$hboxset "select_low"
$hbox 0 "Root_0" -71.330  -34.206  -55.351  76.420  38.566  55.351
$attachment "attach_eye_l" "Head_1" 2.00 8.50 3.50 rotate -0.00 -0.00 0.00
$attachment "attach_eye_r" "Head_1" 2.00 8.50 -3.50 rotate -0.00 -0.00 0.00
$attachment "attach_attack1" "wrist_R" -9.00 0.00 -0.00 rotate -0.00 0.00 -0.00
$attachment "attach_hitloc" "Spine_2" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 6.261 0.011 69.198
$sequence BindPose "BindPose" fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_injured "idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_injured_temp_alt "idle_injured_temp_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence idle_alt1 "idle_alt1" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence idle_alt2 "idle_alt2" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence idle_overload "idle_overload" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_overload_temp_alt "idle_overload_temp_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence idle_overload_injured "idle_overload_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_overload_injured_temp_alt "idle_overload_injured_temp_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence attack_overload "attack_overload" ACT_DOTA_ATTACK 1 fps 30.00
$sequence attack_overload_injured "attack_overload_injured" ACT_DOTA_ATTACK 1 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 6 "Hero_StormSpirit.Footsteps" }
  { event AE_CL_PLAYSOUND 21 "Hero_StormSpirit.Footsteps" }
}

$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 6 "Hero_StormSpirit.Footsteps" }
  { event AE_CL_PLAYSOUND 21 "Hero_StormSpirit.Footsteps" }
}

$sequence run_injured_overload "run_injured_overload" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 6 "Hero_StormSpirit.Footsteps" }
  { event AE_CL_PLAYSOUND 21 "Hero_StormSpirit.Footsteps" }
}

$sequence run_overload "run_overload" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_StormSpirit.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_StormSpirit.Footsteps" }
}

$sequence Roll "Roll" loop ACT_DOTA_OVERRIDE_ABILITY_4 1 fps 30.00
$sequence Roll_pre "Roll_pre" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence Roll_post "Roll_post" ACT_DOTA_STORM_ABILITY_4 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 38.00
$sequence attack_1 "attack_1" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence attack_1_injured "attack_1_injured" ACT_DOTA_ATTACK 2 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence attack_2 "attack_2" ACT_DOTA_ATTACK 3 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence attack_2_injured "attack_2_injured" ACT_DOTA_ATTACK 3 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence attack_3 "attack_3" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence attack_3_injured "attack_3_injured" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 16 }
}

$sequence static_remnant1 "static_remnant1" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant2 "static_remnant2" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant3 "static_remnant3" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant4 "static_remnant4" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant5 "static_remnant5" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant6 "static_remnant6" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence vortex "vortex" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 29 "BodyImpact_Common.Light" }
}

$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00
$sequence teleport "teleport" loop ACT_DOTA_TELEPORT 1 fps 30.00
$sequence loadout "loadout" loop ACT_DOTA_LOADOUT 1 fps 30.00
$sequence victory "victory" loop ACT_DOTA_VICTORY 1 fps 30.00
$sequence capture "capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence turn_lookFrame_0 "turn_lookFrame_0" fps 30.00
$sequence turn_lookFrame_1 "turn_lookFrame_1" fps 30.00
$sequence turn_lookFrame_2 "turn_lookFrame_2" fps 30.00
$sequence turn "turn_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turn_lookFrame_0 turn_lookFrame_1 turn_lookFrame_2
}
