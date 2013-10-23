$cd "H:\dota2resources\heros\silencer\smd"
$modelname "heroes/silencer/silencer.mdl"
$model "default" "silencer_model.dmx.smd"

$lod 1
 {
  replacemodel "silencer_model.dmx" "lod1_silencer_model.dmx"
}
$poseparameter TURN -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "FLSkirt2_1" 24.223  -16.189  -9.841  56.336  5.114  18.212
$hbox 0 "FLSkirt2_0" 38.589  -21.622  -17.615  67.477  5.039  14.150
$hbox 0 "BSkirt4_2" -8.590  -34.870  -5.936  43.630  40.320  15.494
$hbox 0 "BSkirt4_1" 3.787  -39.814  -4.619  45.514  37.569  17.690
$hbox 0 "knee_R" -38.562  -9.650  -9.831  6.387  8.225  11.848
$hbox 0 "thigh_R" -60.741  -8.886  -11.731  7.305  14.421  13.894
$hbox 0 "knee_L" -6.387  -8.225  -11.848  38.562  9.650  9.831
$hbox 0 "thigh_L" -7.305  -14.421  -13.894  60.741  8.886  11.731
$hbox 0 "elbow_L" -3.318  -11.166  -7.872  35.143  7.962  10.145
$hbox 0 "bicep_L" -3.862  -11.557  -10.172  44.895  8.910  11.039
$hbox 0 "LShoulderPad5_0" -17.816  -16.288  -22.050  9.608  29.036  18.393
$hbox 0 "elbow_R" -35.143  -7.962  -10.145  1.649  11.166  7.872
$hbox 0 "bicep_R" -44.895  -8.910  -11.039  3.862  11.557  10.172
$hbox 0 "RShoulderPad6_0" -23.621  -26.345  -17.833  7.639  17.018  18.390
$hbox 0 "FrontRobe1_2" 0.617  -17.842  -0.627  28.388  17.907  5.415
$hbox 0 "FrontRobe1_1" 1.237  -14.347  -2.019  16.911  14.412  2.197
$hbox 0 "FrontRobe1_0" 0.053  -12.771  -2.007  22.776  12.835  0.991
$hbox 0 "Spine_3" -32.069  -16.596  -29.053  8.912  16.596  21.585
$hbox 0 "Spine_2" -11.346  -27.679  -22.087  13.150  27.679  20.309
$hbox 0 "Spine_1" -14.810  -22.773  -20.570  4.248  22.773  14.876
$hbox 0 "FRSkirt3_1" 22.019  -8.080  -25.905  52.480  12.876  22.724
$hbox 0 "FRSkirt3_0" 38.849  -6.775  -11.967  65.768  21.054  19.385
$hbox 0 "Root_0" -16.659  -23.233  -33.798  20.274  22.537  10.824
$hboxset "feet"
$hbox 0 "ankle_R" -30.717  -7.539  -7.871  7.627  6.146  4.641
$hbox 0 "ankle_L" -7.627  -6.146  -4.641  30.717  7.539  7.871
$hboxset "hands"
$hbox 0 "wrist_L" -1.817  -5.894  -12.942  21.283  9.087  7.899
$hbox 0 "wrist_R" -21.283  -9.087  -7.899  1.817  5.894  12.942
$hboxset "head"
$hbox 0 "Head_1" -12.746  -12.454  -21.597  14.285  12.454  29.099
$hboxset "select_high"
$hbox 0 "Spine_3" -39.656  -28.658  -28.673  18.617  28.658  21.259
$hbox 0 "Root_0" -24.048  -29.516  -100.694  28.541  29.516  24.496
$hboxset "select_low"
$hbox 0 "Root_0" -79.154  -88.721  -110.155  83.646  88.721  81.219
$attachment "attach_attack1" "wrist_L" 0.00 0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_attack2" "wrist_R" 0.00 0.00 0.00 rotate -0.00 -0.00 0.00
$attachment "ArbitraryParityChain_plc0_L" "ClothTop0_0_L" 180.00 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "ArbitraryParityChain_plc1_R" "ClothTop1_0_R" -180.00 -0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "Spine_2" 0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -2.404 0.000 104.037
$sequence BindPose "BindPose" fps 30.00
$sequence attack "attack" ACT_DOTA_ATTACK 1 fps 30.00
$sequence cast_COS "cast_COS" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 30 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 63 "BodyImpact_Common.Light" }
  { event AE_CL_PLAYSOUND 57 "WeaponImpact_Common.Light" }
}

$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence cast_GS "cast_GS" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence idle_rare "idle_rare" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Silencer.Footsteps" }
  { event AE_CL_PLAYSOUND 17 "Hero_Silencer.Footsteps" }
}

$sequence capture "capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence victory "victory" loop ACT_DOTA_VICTORY 1 fps 30.00
$sequence defeat "defeat" loop ACT_DOTA_DEFEAT 1 fps 30.00
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
$sequence cast_LW "cast_LW" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend TURN -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
