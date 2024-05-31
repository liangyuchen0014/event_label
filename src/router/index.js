import Vue from "vue";
import VueRouter from "vue-router";
import myHome from "../components/myHome.vue";
Vue.use(VueRouter);

const router = new VueRouter({
	mode: "hash", // 使用 hash 模式
	routes: [
		{
			path: "/",
			name: "myHome",
			component: myHome,
		},
	],
});

export default router;
