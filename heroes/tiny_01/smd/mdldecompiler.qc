$cd "H:\dota2resources\heros\tiny_01\smd"
$modelname "heroes/tiny_01/tiny_01.mdl"
$model "default" "tiny_01_model.dmx.smd"

$lod 1
 {
  replacemodel "tiny_01_model.dmx" "lod1_tiny_01_model.dmx"
}
$cdmaterials ""
$texturegroup skinfamilies
{
	{ "models/heroes/tiny_01/tiny_01_color.vmt" }
	{ "models/items/tiny_01/tiny_01_glacial_color.vmt" }
	{ "models/items/tiny_01/cave_tiny_01.vmt" }
}
$hboxset "default"
$hbox 0 "thigh_R" -20.515  -5.563  -5.893  -1.950  7.123  7.754
$hbox 0 "knee_R" -14.825  -5.657  -5.664  -1.519  5.539  4.519
$hbox 0 "bicep_R" -26.125  -5.706  -9.537  4.922  10.230  8.712
$hbox 0 "elbow_R" -39.871  -7.576  -13.488  -5.812  10.482  11.865
$hbox 0 "spine3" -0.166  -19.686  -17.694  26.518  21.016  19.968
$hbox 0 "bicep_L" -0.260  -7.903  -6.875  18.846  2.827  7.905
$hbox 0 "elbow_L" -4.786  -9.900  -8.372  24.570  4.070  7.598
$hbox 0 "spine2" -5.935  -19.845  -18.557  11.748  17.546  14.035
$hbox 0 "root" -9.267  -14.486  -9.663  15.158  14.246  14.006
$hbox 0 "knee_L" 1.673  -8.475  -8.260  17.669  4.807  7.672
$hbox 0 "thigh_L" -2.768  -9.262  -6.595  19.317  3.216  6.757
$hboxset "feet"
$hbox 0 "ankle_R" -12.280  -8.199  -2.132  5.368  5.241  4.255
$hbox 0 "knee_L" 14.466  -8.822  -9.074  20.454  6.061  8.631
$hboxset "hands"
$hbox 0 "elbow_R" -44.393  -10.129  -13.437  -33.201  12.473  12.128
$hbox 0 "wrist_L" -2.462  -9.590  -12.501  17.517  0.709  6.500
$hboxset "head"
$hbox 0 "head" -8.589  -9.456  -13.808  16.208  11.603  10.009
$hboxset "select_high"
$hbox 0 "root" -1.675  -34.858  -34.331  64.409  33.654  44.595
$hboxset "select_low"
$hbox 0 "root" -49.592  -81.497  -33.734  113.998  73.836  47.640
$attachment "attach_attack1" "wrist_R" 0.00 0.00 0.00 rotate 0.00 -0.00 -0.00
$attachment "attach_attack2" "wrist_L" 0.00 0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_hitloc" "spine3" -0.00 -0.00 0.00 rotate 0.00 0.00 -0.00
$attachment "attach_bird" "spine3" 15.00 20.00 14.00 rotate 0.00 0.00 -0.00
$surfaceprop "default"
$keyvalues  {  } 
$illumposition -1.820 0.524 88.722
$sequence BindPose "BindPose" fps 30.00
$sequence tiny_1_run "tiny_1_run" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 17 "Hero_Tiny.Footsteps" }
  { event AE_CL_PLAYSOUND 26 "Hero_Tiny.Footsteps" }
}

$sequence tiny_1_idle "tiny_1_idle" loop ACT_DOTA_IDLE 5 fps 30.00
$sequence tiny_1_idle_alt "tiny_1_idle_alt" loop ACT_DOTA_IDLE_RARE 3 fps 30.00
$sequence tiny_1_attack1 "tiny_1_attack1" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_1_attack_alt "tiny_1_attack_alt" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_1_death "tiny_1_death" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_1_toss "tiny_1_toss" ACT_TINY_TOSS 1 fps 30.00
$sequence tiny_1_avalanche_long "tiny_1_avalanche_long" ACT_TINY_AVALANCHE 1 fps 30.00
$sequence tiny_1_flail "tiny_1_flail" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_1_stun "tiny_1_stun" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence tiny_1_portrait "tiny_1_portrait" loop ACT_DOTA_CAPTURE 1 fps 30.00
$sequence tiny_1_idle_tree "tiny_1_idle_tree" loop ACT_DOTA_IDLE 1 fps 30.00
$sequence tiny_1_death_tree "tiny_1_death_tree" ACT_DOTA_DIE 1 fps 30.00
$sequence tiny_1_attack_tree "tiny_1_attack_tree" ACT_DOTA_ATTACK 1 fps 30.00
$sequence tiny_1_run_tree "tiny_1_run_tree" loop ACT_DOTA_RUN 1 fps 30.00 {
  { event AE_CL_PLAYSOUND 5 "Hero_Tiny.Footsteps" }
  { event AE_CL_PLAYSOUND 18 "Hero_Tiny.Footsteps" }
}

$sequence tiny_1_stun_tree "tiny_1_stun_tree" loop ACT_DOTA_DISABLED 1 fps 30.00
$sequence Tiny_01_flail_tree "Tiny_01_flail_tree" loop ACT_DOTA_FLAIL 1 fps 30.00
$sequence tiny_1_avalanche_alt_tree "tiny_1_avalanche_alt_tree" ACT_TINY_AVALANCHE 1 fps 30.00
$sequence tiny_1_idle_alt_tree "tiny_1_idle_alt_tree" loop ACT_DOTA_IDLE_RARE 1 fps 30.00
$sequence tiny_1_growl_tree "tiny_1_growl_tree" fps 30.00
$sequence tiny_1_toss_tree "tiny_1_toss_tree" ACT_TINY_TOSS 1 fps 30.00
