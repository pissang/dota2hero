$cd "H:\dota2resources\heros\tuskarr\smd"
$modelname "heroes/tuskarr/tuskarr.mdl"
$model "default" "tusk_model.dmx.smd"

$lod 1
 {
  replacemodel "tusk_model.dmx" "lod1_tusk_model.dmx"
}
$poseparameter turn -1.00 1.00
$cdmaterials ""
$hboxset "default"
$hbox 0 "ankle_R" -36.529  -16.579  -19.384  7.350  11.495  17.291
$hbox 0 "knee_R" -32.226  -13.062  -11.348  -3.409  16.825  20.098
$hbox 0 "thigh_R" -34.400  -17.038  -16.668  -12.931  14.217  25.108
$hbox 0 "ankle_L" -9.818  -11.494  -17.292  36.527  16.580  19.384
$hbox 0 "knee_L" 3.409  -16.821  -20.100  25.513  13.062  11.333
$hbox 0 "thigh_L" 10.109  -14.216  -25.108  34.400  17.971  17.593
$hbox 0 "fish10_0" -8.507  -35.233  -19.155  15.483  18.621  16.240
$hbox 0 "basket1_0" -25.904  -24.917  -31.593  36.720  25.195  23.478
$hbox 0 "weapon4_0" -24.199  -40.458  -35.267  55.999  53.809  58.309
$hbox 0 "wrist_R" -31.901  -30.466  -16.172  0.085  10.357  18.351
$hbox 0 "elbow_R" -36.526  -20.237  -19.361  0.121  18.720  17.768
$hbox 0 "bicep_R" -43.140  -13.218  -14.978  -7.657  10.169  14.867
$hbox 0 "jaw_beard0_0" 2.773  -12.463  -4.929  25.869  12.463  10.084
$hbox 0 "Head_1" -13.099  -25.738  -34.154  43.690  25.370  32.577
$hbox 0 "wrist_L" -1.785  -17.763  -26.588  42.411  33.970  25.826
$hbox 0 "elbow_L" -2.511  -20.223  -17.691  42.246  17.418  19.071
$hbox 0 "bicep_L" 7.657  -12.640  -18.099  35.136  15.663  17.060
$hbox 0 "Spine_3" 2.856  -22.611  -22.391  36.982  20.155  21.792
$hbox 0 "Spine_2" -26.719  -34.236  -40.477  22.607  34.211  33.227
$hbox 0 "Spine_1" -29.647  -35.625  -36.127  15.662  35.625  32.044
$hbox 0 "Root_0" -33.819  -46.020  -40.339  28.204  46.020  10.013
$hboxset "feet"
$hbox 0 "ankle_R" -36.529  -16.579  -19.384  7.350  11.495  17.291
$hbox 0 "ankle_L" -9.818  -11.494  -17.292  36.527  16.580  19.384
$hboxset "hands"
$hbox 0 "wrist_R" -31.901  -30.466  -16.172  0.085  10.357  18.351
$hbox 0 "wrist_L" -1.785  -17.763  -26.588  42.411  33.970  25.826
$hboxset "head"
$hbox 0 "Head_1" -13.099  -25.738  -34.154  43.690  25.370  32.577
$hboxset "select_low"
$hbox 0 "Root_0" -80.100  -90.185  -74.951  74.485  90.185  100.140
$hboxset "select_high"
$hbox 0 "Root_0" -40.038  -44.824  -75.055  34.423  44.824  79.864
$attachment "attach_axe" "wrist_R" -80.00 -33.00 18.00 rotate 0.00 0.00 0.00
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$attachment "attach_mouth" "Head_1" 22.00 -0.00 0.00 rotate 0.00 -0.00 0.00
$attachment "attach_head" "Head_0" 32.50 3.00 21.00 rotate 40.00 0.00 90.00
$attachment "attach_attack2" "wrist_L" 0.00 -0.00 0.00 rotate 0.00 0.00 0.00
$attachment "attach_hitloc" "Spine_2" 0.00 0.00 0.00 rotate 0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -3.656 6.939 60.718
$sequence BindPose "BindPose" fps 30.00
$sequence idle "idle" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle2 "idle2" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence run "run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 16 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 24 "Hero_Tusk.Foley" }
}

$sequence idle_punch "idle_punch" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence idle_punch_alt "idle_punch_alt" ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence death "death" ACT_DOTA_DIE 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 34 "BodyImpact_Common.Medium" }
}

$sequence attack "attack" ACT_DOTA_ATTACK 4 fps 30.00
$sequence attack2 "attack2" ACT_DOTA_ATTACK 1 fps 30.00
$sequence stun "stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence flail "flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence teleport "teleport" ACT_DOTA_TELEPORT 1 fps 30.00
$sequence teleport_end "teleport_end" ACT_DOTA_TELEPORT_END 1 fps 30.00
$sequence spawn "spawn" ACT_DOTA_SPAWN 1 fps 30.00
$sequence frozen_sigil "frozen_sigil" ACT_DOTA_CAST_ABILITY_3 1 fps 30.00
$sequence ice_shards "ice_shards" ACT_DOTA_CAST_ABILITY_1 1 fps 30.00
$sequence walrus_punch "walrus_punch" ACT_DOTA_CAST_ABILITY_4 1 fps 30.00
$sequence portrait2 "portrait2" ACT_DOTA_CAPTURE 1 fps 30.00
$sequence portrait3 "portrait3" ACT_DOTA_CAPTURE 3 fps 30.00
$sequence loadout "loadout" loop ACT_DOTA_LOADOUT 1 fps 30.00
$sequence run_punch "run_punch" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 16 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 24 "Hero_Tusk.Foley" }
}

$sequence idle_injured "idle_injured" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence attack_injured "attack_injured" ACT_DOTA_ATTACK 1 fps 30.00
$sequence run_injured "run_injured" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 1 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 16 "Hero_Tusk.Footsteps" }
  { event AE_CL_PLAYSOUND 20 "Hero_Tusk.Foley" }
}

$sequence loadout_frostiron_raiders_set "loadout_frostiron_raiders_set" loop ACT_DOTA_LOADOUT 1 fps 30.00
$sequence teleport_frostiron_raider_set "teleport_frostiron_raider_set" ACT_DOTA_TELEPORT 1 fps 30.00
$sequence turns_lookFrame_0 "turns_lookFrame_0" fps 30.00
$sequence turns_lookFrame_1 "turns_lookFrame_1" fps 30.00
$sequence turns_lookFrame_2 "turns_lookFrame_2" fps 30.00
$sequence turns "turns_lookFrame_0" fps 30.00 {
  blendwidth 3
  blend turn -1.000000 1.000000
  delta
 turns_lookFrame_0 turns_lookFrame_1 turns_lookFrame_2
}
