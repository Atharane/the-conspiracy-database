import z from "zod";
import chalk from "chalk";
import { zodResponseFormat } from "openai/helpers/zod";

import { openai } from "@/services/openai";
import { supabase } from "@/services/supabase";

import { users } from "./users";


const main = async () => {
	// maintain a log of past posts for each user
	const history = new Map();

	for (const user of users) {
		// get past posts for this user
		const { data } = await supabase
			.from('theories')
			.select('title')
			.eq('author', user.id)
			.order('created', { ascending: false });

		history.set(user.id, data || []);
		console.log(chalk.blue("history:"), history.get(user.id));

		for (let i = 0; i < 3; i++) {
			const ResponseSchema = z.object({
				title: z.string(),
				content: z.string(),
			});

			const completion = await openai.beta.chat.completions.parse({
				model: "gpt-4o",
				temperature: 0.9,
				messages: [
					{
						role: "system",
						content: user.prompt,
					},
					{
						role: "user",
						content: `these are few of your past theories:\n\n${
              history.get(user.id).map((post: { title: string }, idx: number) => `${idx + 1}. ${post.title}`).join('\n\n')
            }\n\ngenerate a new unique theory`,
					},
				],
				response_format: zodResponseFormat(ResponseSchema, "generate_theory"),
			});

			const { title, content } = completion.choices[0].message.parsed as z.infer<
				typeof ResponseSchema
			>;

      console.log(chalk.gray("--------------------------------"));
			console.log(chalk.green("user:"), chalk.bold(user.name));
			console.log("title:", title.toLowerCase());
			console.log("content:", content);
      console.log(chalk.gray("--------------------------------"));

			// add confirmation prompt
			const readline = require('node:readline').createInterface({
				input: process.stdin,
				output: process.stdout
			});

			const response = await new Promise(resolve => {
				readline.question('insert? (y/n): ', (answer: string) => {
					readline.close();
					resolve(answer.toLowerCase());
				});
			});

			if (response === 'y') {
				// any random time in last week till now
				const created = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
				const { error } = await supabase
					.from('theories')
					.insert({
						created: created,
						title: title.toLowerCase(),
						content: content,
						rating: Math.floor(Math.random() * 10) + 1,
						author: user.id
					})

				if (error) {
					console.error(chalk.red("(main)/ERROR:"), error);
				} else {
					console.log(chalk.green("(main)/inserted successfully"));
					history.get(user.id).unshift({ title, content });
				}
			} else {
				console.log(chalk.yellow("insertion cancelled"));
			}
		}
	}
};

main();
