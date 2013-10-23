$cd "H:\dota2resources\heros\slardar\smd"
$modelname "heroes/slardar/slardar.mdl"
$model "default" "slardar_model.dmx.smd"

$lod 1
 {
  replacemodel "slardar_model.dmx" "lod1_slardar_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "Root_0" -41.398  -33.008  -29.283  29.143  33.008  27.059
$hbox 0 "Tail0_1" -2.162  -29.931  -16.337  74.142  30.559  22.198
$hbox 0 "Tail0_3" 3.048  -9.916  -17.620  60.751  9.916  14.503
$hbox 0 "bicep_L" -4.906  -8.812  -10.449  50.753  8.308  12.636
$hbox 0 "elbow_L" -8.197  -7.811  -4.652  37.624  7.679  12.058
$hbox 0 "Head_1" -12.656  -15.426  -31.935  30.007  15.426  14.647
$hbox 0 "bicep_R" -43.473  -9.762  -13.114  4.906  9.329  11.184
$hbox 0 "elbow_R" -44.484  -9.845  -13.599  11.922  8.249  6.274
$hbox 0 "Spine_2" -18.563  -31.162  -20.877  41.086  32.409  29.356
$hbox 0 "Spine_1" -10.169  -28.665  -25.210  20.643  28.665  26.468
$hboxset "select_low"
$hbox 0 "Root_0" -95.586  -81.259  -41.530  65.904  81.217  106.875
$hboxset "hands"
$hbox 0 "wrist_L" 1.582  -7.489  -12.189  28.464  11.642  8.075
$hbox 0 "wrist_R" -21.824  -21.394  -9.849  1.798  3.005  12.405
$hboxset "head"
$hbox 0 "Head_1" -12.656  -15.426  -31.935  30.007  15.426  14.647
$hboxset "weapon"
$hbox 0 "wrist_R" -42.259  -40.990  -28.244  -4.130  -1.606  141.263
$hboxset "select_high"
$hbox 0 "Root_0" -59.145  -40.513  43.978  30.101  39.753  112.381
$hbox 0 "Root_0" -71.609  -47.501  -42.290  41.885  47.459  44.334
$attachment "attach_light" "top_antenna1_2" 2.00 -0.00 -4.00 rotate 0.00 0.00 -0.00
$attachment "attach_attack1" "wrist_R" -30.00 -20.00 140.00 rotate 0.00 -0.00 0.00
$attachment "attach_hitloc" "Spine_2" 0.00 -0.00 0.00 rotate 90.00 0.00 0.00
$attachment "ArbitraryParityChain1_plc2_L" "ear2_0_A_L" 0.00 181.35 -0.00 rotate 0.00 -0.00 0.00
$attachment "ArbitraryParityChain1_plc3_R" "ear3_0_A_R" 0.00 -181.35 -0.00 rotate 0.00 -0.00 0.00
$attachment "WeaponRoot_plc0" "weapon_1" 181.35 181.35 181.35 rotate 0.00 -0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -38.221 9.078 86.871
$sequence BindPose "BindPose" fps 30.00
$sequence spawn_temp "spawn_temp" ACT_DOTA_SPAWN 10 fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 10 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 8 "Hero_Slardar.Movement" }
  { event AE_CL_PLAYSOUND 22 "Hero_Slardar.Movement" }
}

$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 11 }
}

$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 31 "BodyImpact_Common.Medium" }
  { event AE_CL_PLAYSOUND 29 "WeaponImpact_Common.Dull" }
}

$sequence crush "crush" ACT_DOTA_CAST_ABILITY_2 1 fps 30.00
$sequence sprint "sprint" loop ACT_DOTA_RUN 1 fps 45.00 {
  { event AE_CL_PLAYSOUND 0 "Hero_Slardar.MovementSprint" }
  { event AE_CL_PLAYSOUND 5 "Hero_Slardar.Movement" }
  { event AE_CL_PLAYSOUND 20 "Hero_Slardar.Movement" }
}

$sequence bash "bash" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00 {
  { event AE_DOTA_PLAY_SOUND_ATTACK 11 }
}

$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence portrait "portrait" ACT_DOTA_CAPTURE 1 fps 30.00
$sequence amp "amp" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00
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
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
