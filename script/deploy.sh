jump_ssh=ymipro
deploy_dir=/services/deploy/servicer
root_dir=/services/servicer/fe

npm run build
tar zcvf dist.tgz dist
ssh ${jump_ssh} "cp ${deploy_dir}/dist.tgz ${deploy_dir}/dist.tgz_$(date +%Y%m%d%H%M%S) || true"
scp dist.tgz ${jump_ssh}:${deploy_dir}/
ssh ${jump_ssh} "cd ${deploy_dir} && sh ../_deploy_vue.sh ${root_dir} dist.tgz "
