$cd "H:\dota2resources\heros\storm_spirit\smd"
$modelname "heroes/storm_spirit/storm_spirit.mdl"
$model "default" "storm_spirit_model.dmx.smd"

$lod 1
 {
  replacemodel "storm_spirit_model.dmx" "lod1_storm_spirit_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/storm_spirit/storm_spirit_base_color.vmt" }
	{ "models/heroes/storm_spirit/storm_spirit_staticremnant.vmt" }
}
$hboxset "default"
$hbox 0 "knee_L" 3.752  -10.068  -11.753  22.203  6.058  12.040
$hbox 0 "thigh_L" 9.042  -21.982  -18.010  29.789  12.798  16.971
$hbox 0 "knee_R" -22.203  -6.212  -10.097  -3.752  10.324  9.856
$hbox 0 "thigh_R" -29.789  -12.798  -17.805  -9.042  21.982  18.895
$hbox 0 "head" -16.011  -19.170  -7.419  12.279  19.170  19.925
$hbox 0 "elbow_R" -28.627  -14.737  -10.345  2.015  10.116  11.392
$hbox 0 "bicep_R" -30.349  -10.994  -12.812  -1.276  8.188  14.823
$hbox 0 "elbow_L" -1.894  -9.332  -12.716  26.910  13.594  11.547
$hbox 0 "bicep_L" 1.276  -8.188  -14.823  30.349  10.994  12.812
$hbox 0 "spine2" -13.975  -30.060  -23.557  23.322  30.060  16.327
$hbox 0 "root" -22.910  -26.606  -4.875  38.477  26.606  30.522
$hboxset "head"
$hbox 1 "head" -17.104  -16.584  -7.511  20.970  16.584  22.751
$hbox 0 "head" -16.011  -19.170  -7.419  12.279  19.170  19.925
$hboxset "feet"
$hbox 1 "ankle_R" -17.146  -6.369  -3.323  4.978  6.523  10.225
$hbox 1 "ankle_L" -5.805  -6.523  -10.537  19.993  6.369  3.425
$hbox 0 "ankle_L" -5.805  -6.523  -10.537  19.993  6.369  3.425
$hbox 0 "ankle_R" -17.146  -6.369  -3.323  4.978  6.523  10.225
$hboxset "select_low"
$hbox 0 "root" -85.965  -91.770  -63.602  89.942  91.772  72.099
$hboxset "select_high"
$hbox 0 "root" -39.766  -49.062  -64.533  44.739  49.064  15.629
$hbox 0 "root" -29.902  -41.487  16.616  33.503  41.112  74.998
$hboxset "hands"
$hbox 1 "wrist_L" -1.926  -9.539  -10.412  24.539  5.034  8.560
$hbox 1 "wrist_R" -25.267  -5.034  -8.560  1.983  9.539  10.412
$hbox 0 "wrist_R" -25.267  -5.034  -8.560  1.983  9.539  10.412
$hbox 0 "wrist_L" -1.926  -9.539  -10.412  24.539  5.034  8.560
$attachment "attach_attack1" "wrist_R" -14.53 0.16 0.78 rotate -15.41 -170.44 97.06
$attachment "attach_attack2" "wrist_L" 16.15 -0.07 -2.05 rotate 14.72 4.29 -98.43
$attachment "attach_hitloc" "spine2" 0.00 -0.00 0.00 rotate 65.25 -180.00 -90.00
$attachment "attach_portrait" "portrait" 0.00 0.00 0.00 rotate 90.00 90.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 7.661 0.001 77.360
$sequence BindPose "BindPose" fps 30.00
$sequence spawn_temp "spawn_temp" ACT_DOTA_SPAWN 1 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 6 "Hero_StormSpirit.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_StormSpirit.Footsteps" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 8 fps 30.00
$sequence portrait "portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence idle_overload "idle_overload" loop ACT_STORM_SPIRIT_OVERLOAD_IDLE_OVERRIDE 1 fps 30.00
$sequence run_overload "run_overload" loop ACT_STORM_SPIRIT_OVERLOAD_RUN_OVERRIDE 1 fps 30.00
$sequence attack01 "attack01" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 15 }
}

$sequence attack02 "attack02" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 15 }
}

$sequence static_remnant "static_remnant" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant2 "static_remnant2" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence static_remnant_staticpose "static_remnant_staticpose" static_remnant_staticpose 1 fps 5.00
$sequence electric_vortex "electric_vortex" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 29 "BodyImpact_Common.Light" }
}

$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence Roll "Roll" loop ACT_DOTA_OVERRIDE_ABILITY_4 1 fps 30.00
$sequence Roll_pre "Roll_pre" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence Roll_post "Roll_post" ACT_DOTA_STORM_ABILITY_4 1 fps 30.00
$sequence static_remnant_idle "static_remnant_idle" loop ACT_DOTA_OVERRIDE_ABILITY_1 1 fps 30.00
$sequence static_remnant_idle2 "static_remnant_idle2" loop ACT_DOTA_OVERRIDE_ABILITY_1 1 fps 5.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence idle_alt "idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
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
$sequence turn_dupe1_lookFrame_0 "turn_dupe1_lookFrame_0" fps 30.00
$sequence turn_dupe1_lookFrame_1 "turn_dupe1_lookFrame_1" fps 30.00
$sequence turn_dupe1_lookFrame_2 "turn_dupe1_lookFrame_2" fps 30.00
$sequence turn_lookFrame_0 "turn_lookFrame_0" fps 30.00
$sequence turn_lookFrame_1 "turn_lookFrame_1" fps 30.00
$sequence turn_lookFrame_2 "turn_lookFrame_2" fps 30.00
$sequence turn "turn_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turn_lookFrame_0 turn_lookFrame_1 turn_lookFrame_2
}
$sequence turn_dupe1 "turn_dupe1_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turn_dupe1_lookFrame_0 turn_dupe1_lookFrame_1 turn_dupe1_lookFrame_2
}
