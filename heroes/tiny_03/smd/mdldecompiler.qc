$cd "H:\dota2resources\heros\tiny_03\smd"
$modelname "heroes/tiny_03/tiny_03.mdl"
$model "default" "tiny_03_model.dmx.smd"

$lod 1
 {
  replacemodel "tiny_03_model.dmx" "lod1_tiny_03_model.dmx"
}
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/tiny_03/tiny_03_color.vmt" }
	{ "models/items/tiny_03/tiny_03_glacial_color.vmt" }
	{ "models/items/tiny_03/cave_tiny_03.vmt" }
}
$hboxset "default"
$hbox 0 "elbow_R" -93.126  -18.480  -14.330  -6.776  23.973  23.801
$hbox 0 "bicep_R" -69.838  -15.384  -11.880  -6.727  18.718  22.539
$hbox 0 "clavicle_R" -39.425  -25.944  -42.870  -11.764  -8.810  -14.269
$hbox 0 "wrist_L" -6.711  -15.132  -16.253  31.112  6.553  18.375
$hbox 0 "elbow_L" -10.946  -22.202  -17.717  60.974  19.408  23.974
$hbox 0 "bicep_L" -16.649  -14.218  -13.724  70.502  17.448  23.017
$hbox 0 "clavicle_L" 21.960  -7.013  -23.440  60.720  13.086  11.885
$hbox 0 "head" -21.825  -17.545  -11.096  23.768  18.963  20.879
$hbox 0 "spine2" -6.193  18.296  -45.445  15.462  32.022  21.955
$hbox 0 "spine1" -9.884  -28.945  -48.437  35.607  32.934  21.281
$hbox 0 "ankle_R" -12.688  -13.280  -7.000  15.140  13.945  17.665
$hbox 0 "knee_R" -29.793  -13.259  -6.683  -1.127  8.517  10.513
$hbox 0 "thigh_R" -37.496  -9.581  -13.779  -4.600  9.470  6.542
$hbox 0 "knee_L" -1.585  -9.813  -12.510  34.934  13.594  13.022
$hbox 0 "thigh_L" 1.766  -9.399  -6.823  43.657  10.384  11.261
$hbox 0 "root" -26.393  -41.372  -13.079  24.853  28.315  28.135
$hboxset "hands"
$hbox 0 "elbow_R" -93.126  -18.480  -14.330  -6.776  23.973  23.801
$hbox 0 "wrist_L" -6.711  -15.132  -16.253  31.112  6.553  18.375
$hboxset "head"
$hbox 0 "head" -21.825  -17.545  -11.096  23.768  18.963  20.879
$hboxset "select_high"
$hbox 0 "spine1" 21.786  -36.374  -68.590  77.905  35.036  9.793
$hbox 0 "root" -20.774  -38.705  -65.978  40.002  39.678  39.420
$hboxset "feet"
$hbox 0 "ankle_R" -12.688  -13.280  -7.000  15.140  13.945  17.665
$hbox 0 "knee_L" -1.585  -9.813  -12.510  34.934  13.594  13.022
$hboxset "select_low"
$hbox 0 "root" -41.901  -87.964  -65.578  95.804  74.907  100.935
$attachment "attach_attack1" "wrist_R" 0.00 0.00 -0.00 rotate -0.00 0.00 0.00
$attachment "attach_attack2" "wrist_L" 0.00 -0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_eye_r" "head" 16.00 12.00 9.50 rotate -0.00 -0.00 -0.00
$attachment "attach_eye_l" "head" 16.00 -10.00 9.50 rotate -0.00 -0.00 -0.00
$attachment "attach_hitloc" "spine3" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$attachment "attach_bird" "attach_bird" 0.00 0.00 0.00 rotate -0.00 0.00 0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition 0.382 -4.608 89.536
$sequence BindPose "BindPose" fps 30.00
$sequence tiny_03_run "tiny_03_run" loop ACT_DOTA_RUN 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 4 "Hero_Tiny.Footsteps2" }
  { event AE_CL_PLAYSOUND 13 "Hero_Tiny.Footsteps2" }
}

$sequence tiny_03_idle "tiny_03_idle" loop ACT_DOTA_IDLE 3 fps 30.00
$sequence tiny_03_idle_alt "tiny_03_idle_alt" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence tiny_03_attack1 "tiny_03_attack1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_03_attack_alt "tiny_03_attack_alt" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_03_death "tiny_03_death" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_03_avalanche_alt "tiny_03_avalanche_alt" ACT_TINY_AVALANCHE 1 fps 24.00
$sequence tiny_03_toss "tiny_03_toss" ACT_TINY_TOSS 1 fps 24.00
$sequence tiny_03_growl "tiny_03_growl" ACT_TINY_GROWL 1 fps 24.00
$sequence tiny_3_flail "tiny_3_flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_03_stun "tiny_03_stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_03_capture "tiny_03_capture" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence tiny_03_attack1_tree "tiny_03_attack1_tree" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_03_death_tree "tiny_03_death_tree" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_03_idle_tree "tiny_03_idle_tree" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tiny_03_run_tree "tiny_03_run_tree" loop ACT_DOTA_RUN 1 fps 24.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_Tiny.Footsteps2" }
  { event AE_CL_PLAYSOUND 16 "Hero_Tiny.Footsteps2" }
}

$sequence tiny_03_stun_tree "tiny_03_stun_tree" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_3_flail_tree "tiny_3_flail_tree" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_03_avalanche_alt_tree "tiny_03_avalanche_alt_tree" ACT_TINY_AVALANCHE 1 fps 24.00
$sequence tiny_03_growl_tree "tiny_03_growl_tree" ACT_TINY_GROWL 1 fps 24.00
$sequence tiny_03_toss_tree "tiny_03_toss_tree" ACT_TINY_TOSS 1 fps 24.00
$sequence tiny_03_idle_alt_tree "tiny_03_idle_alt_tree" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
